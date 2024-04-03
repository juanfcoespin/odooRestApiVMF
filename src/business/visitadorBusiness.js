const conf = require('../config');
const dbUtils = require('../utils/dbUtils');
const cicloBusiness = require('./cicloBusiness');

async function getRutasByEmailRepresentante(email){
    try{
        var sql=`
        select 
         tx."idRuta",
         tx.dia_ciclo "diaCiclo",
         tx.id "idUnidadVisita",
         tx.name "unidadVisita",
         tx.direccion,
         tx.latitud,
         tx.longitud,
         tx.tipo
        from
        (
           select 
            t0.id "idRuta",
            t0.dia_ciclo,
            t2.id,
            t2.name,
            t2.direccion,
            t2.latitud,
            t2.longitud,
            'medico' tipo,
            t0.representante_id
           from tt_visitas_ruta t0 inner join
			tt_visitas_representante t3 on t3.id=t0.representante_id inner join
            tt_visitas_medico_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
            tt_visitas_medico t2 on t2.id=t1.tt_visitas_medico_id
           where
            t2.Activo=True
			and t3.email=$1
           union all  
           select
            t0.id idRuta,
            t0.dia_ciclo,
            t2.id,
            t2.name,
            t2.direccion,
            t2.latitud,
            t2.longitud,
            'farmacia' tipo,
            t0.representante_id
           from tt_visitas_ruta t0 inner join
			tt_visitas_representante t3 on t3.id=t0.representante_id inner join
            tt_visitas_farmacia_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
            tt_visitas_farmacia t2 on t2.id = t1.tt_visitas_farmacia_id
           where
            t2.Activo=True
			and t3.email=$1
        ) tx
        order by tx.dia_ciclo
        `;
        return await dbUtils.getRows(sql,[email]);
    }catch(e){
        return {
            "error": '\r\ngetRutasByIdVisitador: '+e
        }
    }
    
    
}
async function getByMail(email){
    try{
        var sql=`
        select 
            t0.id,
            t1.name tipo_representante,
            t0.meta_visitas_medicos_ciclo,
            t0.meta_visitas_farmacias_ciclo
        from
            tt_visitas_representante t0 inner join
            tt_visitas_tipo_representante t1 on t1.id=t0.tipo_representante_id
        where
            t0.email='${email}' limit 1`;
        return await dbUtils.getItem(sql);
    }catch(e){
        return {
            "error": '\r\ngetByMail: '+e
        };
    }
    
}
async function getVisitasByIdCicloEmailRepresentante(idCiclo, email){
    try{
        var sql=`
        select
         tx.ciclo,
         tx.dia_ciclo "diaCiclo",
         tx.fecha "fechaVisita",
         tx.id "idUnidadVisita",
         tx.name "unidadVisita",
         tx.tipo
        from(
         select
          t1.name "ciclo",
          t2.dia_ciclo,
          t0.fecha,
          t3.id,
          t3.name,
          'medico' tipo,
          t2.representante_id,
          t0.ciclo_id
         from 
          tt_visitas_visita_medico t0 inner join
          tt_visitas_ciclo_promocional t1 on t1.id=t0.ciclo_id inner join
          tt_visitas_ruta t2 on t2.id = t0.ruta_id inner join
          tt_visitas_medico t3 on t3.id=t0.medico_id inner join
		  tt_visitas_representante t4 on t4.id=t2.representante_id
         where
          t1.activo=True
		  and t4.email=$1
        union all
         select
          t1.name  "ciclo",
          t2.dia_ciclo,
          t0.fecha,
          t3.id,
          t3.name,
          'farmacia' tipo,
          t2.representante_id,
          t0.ciclo_id
         from 
          tt_visitas_visita_farmacia t0 inner join
          tt_visitas_ciclo_promocional t1 on t1.id=t0.ciclo_id inner join
          tt_visitas_ruta t2 on t2.id = t0.ruta_id inner join
          tt_visitas_farmacia t3 on t3.id=t0.farmacia_id inner join
		  tt_visitas_representante t4 on t4.id=t2.representante_id
         where
          t1.activo=True
		  and t4.email=$1
        ) tx
        where
         tx.ciclo_id=$2
        order by
         tx.dia_ciclo
        `;
        return await dbUtils.getRows(sql,[email, idCiclo]);
    }catch(e){
        return{
            "error": '\r\ngetVisitasByIdCicloIdRepresentante: '+e
        };
    }
}
async function getVisitasPendientesByEmailRepresentante(email){
    try{
        var cicloActual = await cicloBusiness.getCicloActual();
        if(cicloActual && cicloActual.error)
            throw(cicloActual.error);
        if(cicloActual){
            var rutas = await getRutasByEmailRepresentante(email);
            //console.log(rutas);
            if(rutas.error)
                throw(rutas.error); 
            const visitas = await getVisitasByIdCicloEmailRepresentante(cicloActual.id, email);
            if(visitas.error)
                throw(visitas.error); 
            
            visitas.forEach(visita=>{
                rutas = rutas.filter(ruta=>!(ruta.diaCiclo==visita.diaCiclo && ruta.idUnidadVisita==visita.idUnidadVisita && ruta.tipo==visita.tipo));
            });
            var diasCiclo=[];
            var diaCicloAnt;
            rutas.forEach(r=>{
                if(r.diaCiclo!=diaCicloAnt){
                    diasCiclo.push({
                        "dia": r.diaCiclo,
                        "mostrar": (r.diaCiclo == cicloActual.diaCicloActual),
                        "rutas":[]
                    });
                    diaCicloAnt=r.diaCiclo;
                }
            });
            diasCiclo.forEach(diaCiclo=>{
                rutas.forEach(r=>{
                    if(diaCiclo.dia==r.diaCiclo)
                        diaCiclo.rutas.push(r);
                });
            });
            return{
                "cicloActual": cicloActual,
                "diasCiclo": diasCiclo,
            };
        }else
            throw("No existe un ciclo activo en la fecha consultada");
    }catch(e){
        return {
            "error": '\r\ngetVisitasPendientesByEmailRepresentante: '+e
        };
    }
}

async function saveVisitas(visitas){
    var ms=[];
    for(let visita of visitas){
        try{
            await saveVisita(visita);
            ms.push('ok');
        }catch(e){
            ms.push('error:\r\nsaveVisitas'+e);
            
        }
    }
    return ms;
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
async function saveVisita(visita){
    try{
        const idRuta = await getIdRuta(visita);
        if(!idRuta){
            const error=`
                No existen rutas para  el representante ${visita.idRepresentante} en el diaCiclo:${visita.diaCicloActual}
                Solicite al administrador la creación de esta ruta!!`
            throw(error);
        }
        if(idRuta && idRuta.error)
            throw(idRuta.error);
        //odoo maneja la hora utf, para traer la fecha actual hay que hacer lo siguiente
        var sql=`
        insert into tt_visitas_visita_${visita.tipoUnidad}(ciclo_id, ruta_id, fecha, comentario, ${visita.tipoUnidad}_id)
        values($1, $2, now()- interval '${conf.confGlobal.zonaHorariaUTF} hour', $3, $4);
        `;
        var params=[visita.idCiclo, idRuta,visita.comentario, visita.idUnidad];
        
        var inserto=await dbUtils.execute(sql, params);
        if(!inserto)
            throw('No se registró la visita!!');
        sql=`select id from tt_visitas_visita_${visita.tipoUnidad} order by id desc limit 1`;
        
        const me= await dbUtils.getItem(sql);
        const idVisita = me.id;
        visita.lineas.forEach(linea=>{
            sql=`
            insert into tt_visitas_visita_${visita.tipoUnidad}_linea(visita_id, articulo_id, cantidad)
            values($1, $2, $3)
            `;
            params=[idVisita, linea.articulo.id, linea.cantidad];
            if(!dbUtils.execute(sql, params))
                throw(`No se registró la linea de visita correspondiente al artículo ${linea.articulo.name}!!`);
        });
        return {
            id: idVisita,
        };

    }catch(e){
        throw('\r\n'+'saveVisita(): '+e);
    }
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
async function getIdRuta(visita){
    try{
        var sql=`
        select 
         id 
        from 
         tt_visitas_ruta 
        where
         representante_id =${visita.idRepresentante}
         and dia_ciclo=${visita.diaCicloActual}
        limit 1
        `;
        ms= await dbUtils.getItem(sql);
        if(ms)
            return ms.id;
        return null;
    }catch(e){
        return {
            "error": '\r\n'+'getIdRuta(): '+ e
        };
    }
}
async function getPedidosSinFacturasPorEmailRepresentante(email){
    try{
        var sql=`
        select 
         id 
        from 
         tt_visitas_ruta 
        where
         representante_id =${visita.idRepresentante}
         and dia_ciclo=${visita.diaCicloActual}
        limit 1
        `;
        const params=[];
        ms= await dbUtils.getRows(sql,params);
        if(ms)
            return ms.id;
        return null;
    }catch(e){
        return {
            "error": '\r\n'+'getIdRuta(): '+ e
        };
    }
}
module.exports={
    getByMail,
    getVisitasPendientesByEmailRepresentante,
    saveVisitas,
    savePedidos,
}
    
    
