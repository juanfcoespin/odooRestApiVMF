const conf = require('../config');
const dbUtils = require('../utils/dbUtils');
const objUtils = require('../utils/objectUtils');
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
async function getVisitasByIdsCicloEmailRepresentanteConLineas(me){
    try{
        let visitas = await getVisitasByIdsCicloEmailRepresentante(me.idCiclo, me.email, me.fechaDesde, me.fechaHasta);
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
        to_char(tx.fecha,'yyyy-mm-dd') "fechaVisita",
        tx.fecha,
        tx.id "idUnidadVisita",
        tx.name "unidadVisita",
        tx.tipo,
        tx.comentario
    from(
        select
         t0.id "idVisita",
         t1.name "ciclo",
         t2.dia_ciclo,
         t0.fecha,
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
            const visitasMedidos=visitas.filter(v=>v.tipo=='medico');
            const visitasFarmacia=visitas.filter(v=>v.tipo=='farmacia');

            let rutasPendientes = objUtils.getObjectCopy(rutas); //en donde se calculará las rutas pendientes a visitar del representante
            rutasPendientes=rutasPendientes.sort((a, b) => a.diaCiclo - b.diaCiclo); //se orden por día de ciclo en orden ascendente;
            //se quitan los médicos ya visitados
            visitasMedidos.forEach(vm=>{
                rutasPendientes = rutasPendientes.filter(ruta=>!(ruta.idUnidadVisita==vm.idUnidadVisita && vm.tipo==ruta.tipo));
            });
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
        console.log(visita);
        const idRuta = await getIdRuta(visita);
        console.log(idRuta);
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

    }catch(e){
        throw('\r\n'+'saveVisita(): '+e);
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
    if(!await dbUtils.execute(sql, params))
        throw(`No se registró la linea de Control Exhibicion correspondiente al artículo ${articulo}!!`);
}
async function insertLineaVisita(tipoUnidad, idVisita, linea){
    sql=`
    insert into tt_visitas_visita_${tipoUnidad}_linea(visita_id, articulo_id, cantidad)
    values($1, $2, $3)
    `;
    params=[idVisita, linea.articulo.id, linea.cantidad];
    if(!await dbUtils.execute(sql, params))
        throw(`No se registró la linea de visita correspondiente al artículo ${linea.articulo.name}!!`);
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
module.exports={
    getByMail,
    getVisitasPendientesByEmailRepresentante,
    saveVisitas,
    getVisitasByIdsCicloEmailRepresentanteConLineas,
    getVisitasCiclosAnteriorByEmailRepresentante,
}
    
    
