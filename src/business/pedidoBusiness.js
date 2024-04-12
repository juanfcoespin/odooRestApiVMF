const conf = require('../config');
const dbUtils = require('../utils/dbUtils');


async function getByMailRepresentante(email){
    try{
        var sql=`
        select 
            t0.id,
            t0.fecha,
            to_char(t0.fecha,'yyyy-mm-dd') "fechaStr",
            t0.distribuidor_id,
            t3.name "distribuidor",	
            t0.farmacia_id,	
            t4.name "farmacia",
            t2.name "representante"
        from tt_visitas_pedido t0 inner join
            tt_base_contacto t1 on t1.id=t0.distribuidor_id inner join
            tt_visitas_representante t2 on t2.id=t0.representante_id inner join
            tt_base_contacto t3 on t3.id=t0.distribuidor_id inner join
            tt_visitas_farmacia t4 on t4.id=t0.farmacia_id
        where
            t2.email=$1
        order by t0.fecha
        `;
        

        var pedidos=await dbUtils.getRows(sql,[email]);
        for(var pedido of pedidos){
            var sql=`
            select
                t1.name "articulo",
                t0.precio,
                t0.cantidad,
                t0.cant_bonificada,
                t0.porcentaje_descuento "porcentajeDescuento"
            from
                tt_visitas_pedido_linea t0 inner join
                tt_visitas_articulo t1 on t1.id=t0.articulo_id
            where
                t0.pedido_id=$1
            `;
            pedido.lineas=await dbUtils.getRows(sql,[pedido.id]);
        }
        pedidos.forEach(pedido=>{
            pedido.subtotal=0;
            pedido.descuento=0;
            pedido.lineas.forEach(linea=>{
                linea.subtotal = linea.precio * linea.cantidad;
                linea.descuento=linea.subtotal*linea.porcentajeDescuento;
                linea.total = linea.subtotal - linea.descuento;
                pedido.subtotal += linea.subtotal;
                pedido.descuento += linea.descuento;
            });
            pedido.total = pedido.subtotal - pedido.descuento;
        });
        return pedidos;
    }catch(e){
        return {
            "error": '\r\ngetByMail: '+e
        };
    }
}

async function savePedidos(pedidos){
    var ms=[];
    for(let pedido of pedidos){
        try{
            await savePedido(pedido);
            ms.push('ok');
        }catch(e){
            ms.push('error:\r\nsavePedidos'+e);
        }
    }
    return ms;
}

async function savePedido(pedido){
    try{
        //odoo maneja la hora utf, para traer la fecha actual hay que hacer lo siguiente
        const fecha="to_date('"+pedido.fechaPedido.substring(0, 10)+"', 'yyyy-mm-dd')";
        
        var sql=`
        insert into tt_visitas_pedido(distribuidor_id, farmacia_id, fecha, correo_adicional, observaciones)
        values($1, $2, ${fecha}, $3, $4);
        `;
        console.log(sql);
        //throw(sql);
        var params=[pedido.distribuidor.id, pedido.farmacia.id, pedido.correoAdicional, pedido.observaciones];
        await dbUtils.execute(sql, params);
        
        sql=`select id from tt_visitas_pedido order by id desc limit 1`;
        const me= await dbUtils.getItem(sql);
        const idPedido = me.id;
        pedido.lineas.forEach(linea=>{
            if(!linea.porcentajeDescuento)
                linea.porcentajeDescuento=0;
            sql=`
            insert into tt_visitas_pedido_linea(pedido_id, articulo_id, porcentaje_descuento, cantidad, cant_bonificada)
            values($1, $2, $3, $4, $5)
            `;
            params=[idPedido, linea.articulo.id, linea.porcentajeDescuento/100, linea.cantidad, linea.bonificacion];
            if(!dbUtils.execute(sql, params))
                throw(`No se registró la linea del pedido correspondiente al artículo ${linea.articulo.name}!!`);
        });
        return {
            id: idPedido,
        };

    }catch(e){
        throw('\r\n'+'savePedido(): '+e);
    }
}


module.exports={
    getByMailRepresentante,
    savePedidos,
}
    
    
