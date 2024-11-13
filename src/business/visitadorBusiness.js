const conf = require('../config');
const dbUtils = require('../utils/dbUtils');
const objUtils = require('../utils/objectUtils');
const cicloBusiness = require('./cicloBusiness');
const pedidoBusiness = require('./pedidoBusiness');
const axios = require('axios');

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
        order by tx.dia_ciclo, tx.name
        `;
        return await dbUtils.getRows(sql,[email]);
    }catch(e){
        return {
            "error": '\r\ngetRutasByIdVisitador: '+e
        }
    }
}
async function getVisitasCiclosAnteriorByEmailRepresentante(email){
    /*
    trae las visitas hasta de los 2 penúltimos ciclos
    Ej. si el ciclo actual es el 5, trae las visitas de los ciclos 3 y 4
    */
    try{
        var sql=`
        select id from tt_visitas_ciclo_promocional
        order by fecha_inicio desc
        limit 3
        `;
        ids= await dbUtils.getRows(sql);
        if(ids.length<=1) // no tiene ciclo anterior
            return [];
        else{ 
            if(ids.length==2)
                idsCicloAnterior=ids[1].id;
            if(ids.length==3)
                idsCicloAnterior=ids[1].id+', '+ids[2].id;
            let ms= await getVisitasByIdsCicloEmailRepresentante(idsCicloAnterior,email);
            for(let visita of ms){
                visita.lineas = await getLineasVisitaById(visita);
            }
            return ms;
        }
    }catch(e){
        return{
            "error": '\r\ngetVisitasCicloAnteriorByEmailRepresentante: '+e
        };
    }
}
async function getByMail(email){
    try{
        var sql=`
        select 
            t0.id,
            t1.name tipo_representante,
            COALESCE(t0.meta_visitas_medicos_ciclo,0) meta_visitas_medicos_ciclo,
            COALESCE(t0.meta_visitas_farmacias_ciclo,0) meta_visitas_farmacias_ciclo,
            COALESCE(t2.meta_ventas,0) meta_ventas
        from
            tt_visitas_representante t0 inner join
            tt_visitas_tipo_representante t1 on t1.id=t0.tipo_representante_id left outer join
			tt_visitas_periodo_representante t2 on t2.representante_id=t0.id and t2.activo=true
        where
            t0.email=$1 limit 1
        `;
        var info = await dbUtils.getItem(sql,[email]);
        var currentCiclo = await cicloBusiness.getCicloActual();
        if(!currentCiclo)
            throw('No hay ciclo actual activo!!. Notifique al administrador!!');
        
        var visitas = await getVisitasByIdsCicloEmailRepresentante([currentCiclo.id], email);
        var numVisitasMedico=0;
        var numVisitasFarmacia=0;
        
        if(visitas){
            const visitasMedico = visitas.filter(f=>f.tipo=='medico');
            if(visitasMedico)
                numVisitasMedico=visitasMedico.length;
            const visitasFarmacia = visitas.filter(f=>f.tipo=='farmacia');
            if(visitasFarmacia)
                numVisitasFarmacia=visitasFarmacia.length;
        }
        var kpis=[];
        if(info.tipo_representante!='Mercaderista'){ // los mercaderistas no visitan médicos
            kpis.push({nombre: "Visitas Médicos", meta: info.meta_visitas_medicos_ciclo, valor: numVisitasMedico});
        }
        kpis.push(
            {nombre: "Visitas Farmacia", meta: info.meta_visitas_farmacias_ciclo, valor: numVisitasFarmacia},
        );
        var totalFacturado = await pedidoBusiness.getMontoFacturadoEnEsteMesByEmailRepresentante(email);
        kpis.push(
            {nombre: "Pedidos (USD)", meta: info.meta_ventas, valor: totalFacturado},
        );
        
        return {
            id: info.id,
            tipoRepresentante: info.tipo_representante,
            kpis: kpis
        }
    }catch(e){
        return {
            "error": '\r\ngetByMail: '+e
        };
    }
    
}
async function getVisitasByIdsCicloEmailRepresentanteConLineas(me){
    try{
        let visitas = await getVisitasByIdsCicloEmailRepresentante([me.cicloSeleccionado.id], me.email, me.fechaDesde, me.fechaHasta);
        for(let visita of visitas){
            visita.lineas = await getLineasVisitaById(visita);
        }
        return visitas;
    }catch(e){
        //console.log(e);
        return{
            "error": "getVisitasByIdsCicloEmailRepresentanteConLineas: "+e
        };
    }
    
}
async function getVisitasByIdsCicloEmailRepresentante(idsCiclo, email, fechaDesde=null, fechaHasta=null){
    try{
        var sql=`
    select
        tx."idVisita",
        tx.ciclo,
        tx.dia_ciclo "diaCiclo",
        to_char(tx.fecha,'yyyy-mm-dd HH24:mi:ss') "fechaVisita",
        tx.fecha,
        tx.id "idUnidadVisita",
        tx.name "unidadVisita",
        tx.tipo,
        tx.personas_visita "personasVisita",
        tx.comentario
    from(
        select
         t0.id "idVisita",
         t1.name "ciclo",
         t2.dia_ciclo,
         t0.fecha,
         '' personas_visita,
         t3.id,
         t3.name,
         'medico' tipo,
         t2.representante_id,
         t0.ciclo_id,
         t0.comentario,
          t4.email
        from 
         tt_visitas_visita_medico t0 inner join
         tt_visitas_ciclo_promocional t1 on t1.id=t0.ciclo_id inner join
         tt_visitas_ruta t2 on t2.id = t0.ruta_id inner join
         tt_visitas_medico t3 on t3.id=t0.medico_id inner join
         tt_visitas_representante t4 on t4.id=t2.representante_id
       union all
        select
         t0.id "idVisita",
         t1.name  "ciclo",
         t2.dia_ciclo,
         t0.fecha,
         t0.personas_visita,
         t3.id,
         t3.name,
         'farmacia' tipo,
         t2.representante_id,
         t0.ciclo_id,
         t0.comentario,
          t4.email
        from 
         tt_visitas_visita_farmacia t0 inner join
         tt_visitas_ciclo_promocional t1 on t1.id=t0.ciclo_id inner join
         tt_visitas_ruta t2 on t2.id = t0.ruta_id inner join
         tt_visitas_farmacia t3 on t3.id=t0.farmacia_id inner join
         tt_visitas_representante t4 on t4.id=t2.representante_id
       ) tx
    where
         tx.email=$1
         and tx.ciclo_id in (${idsCiclo})
    `;
        if(fechaDesde && fechaHasta){
          fechaDesde = fechaDesde.substring(0, 10);
          fechaHasta = fechaHasta.substring(0, 10);
          sql+=` and to_date(to_char(tx.fecha,'yyyy-mm-dd'), 'yyyy-mm-dd') between to_date('${fechaDesde}', 'yyyy-mm-dd') and to_date('${fechaHasta}', 'yyyy-mm-dd')`  
        }
        sql+=' order by tx.dia_ciclo';
        return await dbUtils.getRows(sql, [email]);
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
            if(rutas.error)
                throw(rutas.error); 
            const visitas = await getVisitasByIdsCicloEmailRepresentante(cicloActual.id, email);
            
            /*
            Para las visitas pendientes se toma en cuenta los siguientes lineamientos:
             1. El representante solo puede vistar una vez al médico en el ciclo
             2. Las visitas en la farmacia dependen de la planificacion de rutas (Se consulta el campo "Número de Visitas por Ciclo")
            */
            if(visitas.error)
                throw(visitas.error); 
            //analizamos las rutas que hay que excluir
            //médicos
            const visitasMedicos=visitas.filter(v=>v.tipo=='medico');
            //console.log('medicos visitados')
            //console.log(visitasMedicos.filter(v=>v.idUnidadVisita==20498 || v.unidadVisita=='SANCHEZ SANCHEZ JOSE GONZALO'));
            const visitasFarmacia=visitas.filter(v=>v.tipo=='farmacia');

            let rutasPendientes = objUtils.getObjectCopy(rutas); //en donde se calculará las rutas pendientes a visitar del representante
            rutasPendientes=rutasPendientes.sort((a, b) => a.diaCiclo - b.diaCiclo); //se orden por día de ciclo en orden ascendente;
            //se quitan los médicos ya visitados
            visitasMedicos.forEach(vm=>{
                rutasPendientes = rutasPendientes.filter(ruta=>!(ruta.idUnidadVisita==vm.idUnidadVisita && vm.tipo==ruta.tipo));
            });
            //20498
            //console.log(rutasPendientes.filter(r=>r.idUnidadVisita==20498));
            //se quitan las farmacias ya visitadas
            //numVisitasCiclo
            rutasFarmaciaAQuitar=[];
            rutasPendientes.forEach(rp=>{
                visitasFarmacia.forEach(vf=>{
                    if(rp.idUnidadVisita==vf.idUnidadVisita &&  rp.tipo==vf.tipo){
                        numVistasCicloPlanificadas = rutas.filter(r=>r.idUnidadVisita==vf.idUnidadVisita && r.tipo==vf.tipo).length; //por representante
                        vistasALaFarmacia=visitasFarmacia.filter(v=>v.idUnidadVisita==vf.idUnidadVisita);
                        numVisitas = vistasALaFarmacia.length;
                        if(numVisitas>=numVistasCicloPlanificadas){ //se quita la farmacia de las rutas a visitar
                            rutasPendientes = rutasPendientes.filter(ruta=>!(ruta.idUnidadVisita==vf.idUnidadVisita && ruta.tipo==vf.tipo));
                        }else{
                            if(numVisitas>0 && numVistasCicloPlanificadas>numVisitas){
                                const index=rutasFarmaciaAQuitar.findIndex(p=>p.idFarmacia==vf.idUnidadVisita);
                                if(index == -1){//si no encontró
                                    rutasFarmaciaAQuitar.push({
                                        "diaCiclo":rp.diaCiclo,
                                        "idFarmacia": vf.idUnidadVisita,
                                        "numVisitas": numVisitas 
                                    });
                                }                                
                            }
                        }
                    }
                });
            });
            //se quitan las farmacias ya vistadas de las rutas mas antiguas
            
            rutasFarmaciaAQuitar.forEach(f=>{
                rutasPendientes = rutasPendientes.filter(ruta=>!(ruta.idUnidadVisita==f.idFarmacia && ruta.tipo=='farmacia' && ruta.diaCiclo==f.diaCiclo));
            });
            //console.log(rutasPendientes);
            var diasCiclo=[];
            var diaCicloAnt;
            rutasPendientes.forEach(r=>{
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
                rutasPendientes.forEach(r=>{
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
async function saveVisita(visita){
    try{
        /*if(!visita.fecha)
            throw('Requiere actualizar la versión del aplicativo a la 3.4.6.18 o superior para capturar la fecha de la visita!!');*/
        if(visita.diaCicloActual<=0)
            visita.diaCicloActual=1;        
        if(visita.diaCicloActual>20)
            visita.diaCicloActual=20;
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
        const tabla=`tt_visitas_visita_${visita.tipoUnidad}`;
        var sql="";
        if(visita.tipoUnidad=='medico'){
            /*sql=`
                insert into ${tabla} (ciclo_id, ruta_id, fecha, comentario, ${visita.tipoUnidad}_id)
                values($1, $2, now()- interval '${conf.confGlobal.zonaHorariaUTF} hour', $3, $4);
            `;*/
            if(await VisitaMedicoEnCicloRegistrada(visita.idRepresentante, visita.idCiclo,visita.idUnidad)){
                throw('En la base de datos ya se ha registrado la visita de este médico en el presente ciclo!!');
            }
            console.log('Permitido resgistrar medico');
            sql=`
                insert into ${tabla} (ciclo_id, ruta_id, fecha, comentario, ${visita.tipoUnidad}_id, create_date, write_date)
                values($1, $2, $3, $4, $5, now(), now());
            `;
            var params=[visita.idCiclo, idRuta, visita.fecha, visita.comentario, visita.idUnidad];
        }
        if(visita.tipoUnidad=='farmacia'){
            sql=`
                insert into ${tabla} (ciclo_id, ruta_id, fecha, personas_visita, comentario, ${visita.tipoUnidad}_id, create_date, write_date)
                values($1, $2, $3, $4, $5, $6, now(), now());
            `;
            var params=[visita.idCiclo, idRuta, visita.fecha, visita.personasVisita, visita.comentario, visita.idUnidad];
            console.log(sql);
            console.log(params);
        }
        var inserto=await dbUtils.execute(sql, params);
        if(!inserto)
            throw('No se registró la visita!!');
        sql=`select id from ${tabla} order by id desc limit 1`;
        
        const me= await dbUtils.getItem(sql);
        const idVisita = me.id;
        try{ // si hay un error en las transacciones hijo se hace rollback
            if(visita.lineas){
                for(let linea of visita.lineas){
                    await insertLineaVisita(visita.tipoUnidad, idVisita, linea);
                }
            }
            if(visita.lineasCE){
                for(let linea of visita.lineasCE){
                    await insertLineaControlExhibicion(idVisita, linea);
                }
            }
            
            return {
                id: idVisita,
            };

        }catch(e){// se hacer rollback
            sql=`delete from ${tabla} where id=$1`;
            await dbUtils.execute(sql,[idVisita]);
            throw('\r\n'+'saveVisita(): '+e);
        }
        
    }catch(e){
        throw('\r\n'+'saveVisita(): '+e);
    }
}
async function VisitaMedicoEnCicloRegistrada(idRepresentante, idCiclo, idMedico){
    try{
   
        sql=`
            select 
             count(*) num
            from 
             tt_visitas_visita_medico t0 inner join
             tt_visitas_ruta t1 on t1.id=t0.ruta_id
            where
             t1.representante_id = $1
             and t0.ciclo_id = $2
             and t0.medico_id= $3
        `;
        var ms=await dbUtils.getItem(sql, [idRepresentante, idCiclo, idMedico]);
        if(ms && ms.num)
            return (ms.num>0);
        return false;
    }catch(e){
        throw('\r\n'+'VisitaMedicoEnCicloRegistrada(): '+e);
    }

}
async function getLineasVisitaById(visita){
    try{
        sql=`
        select 
         t0.articulo_id, 
         t1.name "articulo",
         t0.cantidad
        from tt_visitas_visita_${visita.tipo}_linea t0 inner join
         tt_visitas_articulo t1 on t1.id=t0.articulo_id
        where t0.visita_id=$1
    `;
    var ms=await dbUtils.getRows(sql, [visita.idVisita]);
    return ms;
    }catch(e){
        throw('\r\n'+'getLineasVisitaById(): '+e);
    }
}
async function getLineasControlExhibicionById(idVisita){
    try{
        sql=`
        select articulo, cantidad, tipo, precio, estado, comentario
        from tt_visitas_control_exhibicion_linea
        where visita_id=$1
    `;
    return await dbUtils.getRows(sql, [idVisita])
    }catch(e){
        throw('\r\n'+'getLineaControlExhibicionById(): '+e);
    }
}
async function insertLineaControlExhibicion(idVisita, linea){
    try{
        let articulo='';
        if(linea.tipoCE=='Competencia')
            articulo=linea.articulo;
        else
            articulo=linea.articulo.name; //del catalogo de producto terminado o material de exhibición
        sql=`
        insert into tt_visitas_control_exhibicion_linea(visita_id, articulo, cantidad, tipo, precio, estado, comentario)
        values($1, $2, $3, $4, $5, $6, $7)
        `;
        params=[idVisita, articulo, linea.cantidad, linea.tipoCE, linea.precio, linea.estadoArticuloCE, linea.comentario];
        await dbUtils.execute(sql, params);
        sql="select max(id) id  from tt_visitas_control_exhibicion_linea";
        item = await dbUtils.getItem(sql);
        await guardarFoto(item.id, linea.foto);
        
    }catch(e){
        throw("insertLineaControlExhibicion: "+e);
    }
    

}
async function guardarFoto(idLinea, foto){
    //console.log(idLinea);
    //console.log(foto);
    odooConf = conf.confDb.odoo;
    //console.log(odooConf);
    url = odooConf.url+'/jsonrpc';
    //console.log(url);
    axios.post(url,{
            jsonrpc: "2.0",
            method: "call",
            params: {
                service: "object",
                method: "execute_kw",
                args: [conf.confDb.database, odooConf.idUser, odooConf.pwd, "tt_visitas.control_exhibicion_linea", "write", [[idLinea],{"foto": foto}]],
                "kwargs": {}
            },
            "id": 2
        }
    ).then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.log('Error:', error)
    });
}
async function insertLineaVisita(tipoUnidad, idVisita, linea){
    tabla =`tt_visitas_visita_${tipoUnidad}`; 
    sql=`
    insert into ${tabla}_linea(visita_id, articulo_id, cantidad)
    values($1, $2, $3)
    `;
    params=[idVisita, linea.articulo.id, linea.cantidad];
    if(!await dbUtils.execute(sql, params))
        throw(`No se registró la linea de visita correspondiente al artículo ${linea.articulo.name}!!`);
    else
        await descontarInventario(idVisita, tabla, linea);
}
async function descontarInventario(idVisita, tabla, linea){
    try{
        idBodega = await getIdBodega(idVisita, tabla);
        sql=`
            update tt_visitas_inventario
             set cantidad = cantidad - $1
            where 
             bodega_id = $2
             and articulo_id = $3
             and activo = true
        `;
        params=[linea.cantidad, idBodega, linea.articulo.id];
        await dbUtils.execute(sql, params);
    }catch(e){
        throw('descontarInventario '+e);
    }
    

}
async function getIdBodega(idVisita, tabla){
    try{
        sql=`
        select 
         t1.representante_id
        from 
         ${tabla} t0 inner join
         tt_visitas_ruta t1 on t1.id=t0.ruta_id
        where 
            t0.id=$1
        `;
        item = await dbUtils.getItem(sql, [idVisita]);
        return item.representante_id;
    }catch(e){
        throw('getIdBodega '+e);
    }
}
async function getIdRuta(visita){
    try{
        if(visita && visita.diaCicloActual<0)
            visita.diaCicloActual=1;
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
module.exports={
    getByMail,
    getVisitasPendientesByEmailRepresentante,
    saveVisitas,
    getVisitasByIdsCicloEmailRepresentanteConLineas,
    getVisitasCiclosAnteriorByEmailRepresentante,
    VisitaMedicoEnCicloRegistrada,
}
    
    
