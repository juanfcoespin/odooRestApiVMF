const conf = require('../config');
const dbUtils = require('../utils/dbUtils');


async function getByMailRepresentante(email, fechaDesde=null, fechaHasta=null){
    try{
        var sql=`
        select 
            t0.id "idBdd",
            t0.fecha "fechaPedido",
            to_char(t0.fecha,'yyyy-mm-dd') "fechaStr",
            t0.distribuidor_id,
            t3.name "distribuidorName",	
            t0.farmacia_id,	
            t4.name "farmaciaName",
            t2.name "representante",
            t0.correo_adicional "correoAdicional",
            t0.observaciones
        from tt_visitas_pedido t0 inner join
            tt_base_contacto t1 on t1.id=t0.distribuidor_id inner join
            tt_visitas_representante t2 on t2.id=t0.representante_id inner join
            tt_base_contacto t3 on t3.id=t0.distribuidor_id inner join
            tt_visitas_farmacia t4 on t4.id=t0.farmacia_id
        where
            t2.email=$1`;
        if(fechaDesde && fechaHasta){
            fechaDesde = fechaDesde.substring(0, 10);
            fechaHasta = fechaHasta.substring(0, 10);
            sql+=` and to_date(to_char(t0.fecha,'yyyy-mm-dd'), 'yyyy-mm-dd') between to_date('${fechaDesde}', 'yyyy-mm-dd') and to_date('${fechaHasta}', 'yyyy-mm-dd')`  
        }else{ //trae los pedidos de la fecha actual 3 meses atras
            sql+=` and to_date(to_char(t0.fecha,'yyyy-mm-dd'), 'yyyy-mm-dd') between CURRENT_DATE - INTERVAL '2 months' and now()`  
        }
        sql+=" order by t0.fecha limit 200";

        var pedidos=await dbUtils.getRows(sql,[email]);
        for(var pedido of pedidos){
            await setLineasEnPedido(pedido);
            await setFacturasEnPedido(pedido);
        }
        pedidos.forEach(pedido=>{
            pedido.distribuidor={id:pedido.distribuidor_id, name:pedido.distribuidorName};
            pedido.farmacia={id:pedido.farmacia_id, name:pedido.farmaciaName};
            pedido.total = pedido.subtotal - pedido.descuento;
        });
        return pedidos;
    }catch(e){
        return {
            "error": '\r\ngetByMail: '+e
        };
    }
}
async function setLineasEnPedido(pedido){
    var sql=`
    select
        t1.name "articuloName",
        t0.precio,
        t0.cantidad,
        t0.cant_bonificada "bonificacion",
        t0.porcentaje_descuento "porcentajeDescuento"
    from
        tt_visitas_pedido_linea t0 inner join
        tt_visitas_articulo t1 on t1.id=t0.articulo_id
    where
        t0.pedido_id=$1
    `;
    pedido.lineas=await dbUtils.getRows(sql,[pedido.idBdd]);
    pedido.subtotal=0;
    pedido.descuento=0;
    pedido.lineas.forEach(linea=>{
        linea.articulo={
            name: linea.articuloName,
            precio: linea.precio
        };
        linea.subtotal = linea.precio * linea.cantidad;
        linea.descuento=linea.subtotal*linea.porcentajeDescuento;
        linea.total = linea.subtotal - linea.descuento;
        linea.porcentajeDescuento*=100;
        pedido.subtotal += linea.subtotal;
        pedido.descuento += linea.descuento;
    });
}
async function setFacturasEnPedido(pedido){
    var sql=`
    select
        fecha,
        num_factura_distribuidor "numFactura",
        valor
    from tt_visitas_factura
    where pedido_id=$1
    `;
    pedido.facturas=await dbUtils.getRows(sql,[pedido.idBdd]);
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
async function saveFacturas(pedido){
    if(!pedido.facturas)
        return;
    // para no tener que actualizar las facturas, se borran las existentes
    var sql=`
    delete from tt_visitas_factura
    where pedido_id=$1
    `;
    var params=[pedido.idBdd];
    await dbUtils.execute(sql, params);
    //se insertan las facturas
    for(let factura of pedido.facturas){
        const fecha=dbUtils.getDateFromJs(factura.fecha);
        var sql=`
        insert into tt_visitas_factura(pedido_id, fecha, num_factura_distribuidor ,num_pedido_distribuidor, valor)
        values($1,${fecha}, $2, $3, $4);
        `;
        var params=[pedido.idBdd, factura.numFactura, factura.numPedido, factura.valor];
        await dbUtils.execute(sql, params);
    }
}
async function savePedido(pedido){
    try{
        //odoo maneja la hora utf, para traer la fecha actual hay que hacer lo siguiente
        const fecha=dbUtils.getDateFromJs(pedido.fechaPedido);
        const actualizarPedido=(pedido.idBdd!=null);
        //las actualizaciones solo se dan para cargar las facturas asociadas al pedido
        if(actualizarPedido){
            await saveFacturas(pedido);
            return {
                id: pedido.idBdd,
            };
        }
        var sql=`
        insert into tt_visitas_pedido(representante_id,distribuidor_id, farmacia_id, fecha, correo_adicional, observaciones)
        values($1, $2, $3, ${fecha}, $4, $5);
        `;
        var params=[pedido.idRepresentante, pedido.distribuidor.id, pedido.farmacia.id, pedido.correoAdicional, pedido.observaciones];
        await dbUtils.execute(sql, params);
        
        sql=`select id from tt_visitas_pedido order by id desc limit 1`;
        const me= await dbUtils.getItem(sql);
        const idPedido = me.id;
        for(let linea of pedido.lineas){
            if(!linea.porcentajeDescuento)
                linea.porcentajeDescuento=0;
            sql=`
            insert into tt_visitas_pedido_linea(pedido_id, articulo_id, precio, porcentaje_descuento, cantidad, cant_bonificada)
            values($1, $2, $3, $4, $5, $6)
            `;
            params=[idPedido, linea.articulo.id, linea.articulo.precio, linea.porcentajeDescuento/100, linea.cantidad, linea.bonificacion];
            try{
                await dbUtils.execute(sql, params)
            }catch(e){
                throw(`No se registró la linea del pedido correspondiente al artículo ${linea.articulo.name}!!`);
            }
        }
        return {
            id: idPedido,
        };

    }catch(e){
        throw('\r\n'+'savePedido(): '+e);
    }
}
async function getMontoFacturadoEnEsteMesByEmailRepresentante(email){
    try{
        sql=`
        select 
           COALESCE(sum(t0.valor),0) monto --ifnull
        from tt_visitas_factura t0 inner join
            tt_visitas_pedido t1 on t1.id=t0.pedido_id inner join
            tt_visitas_representante t2 on t2.id=t1.representante_id
        where
            t2.email=$1
            and to_char(t0.fecha,'yyyy-mm')=to_char(now(),'yyyy-mm')
        `;
        var item = await dbUtils.getItem(sql,[email]);
        return item.monto;
    }catch{
        return 0;
    }
}
module.exports={
    getByMailRepresentante,
    savePedidos,
    getMontoFacturadoEnEsteMesByEmailRepresentante,
}
    
    
