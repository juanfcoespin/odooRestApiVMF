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
            if(rutas.error)
                throw(rutas.error); 
            const visitas = await getVisitasByIdCicloEmailRepresentante(cicloActual.id, email);
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
            console.log(rutasFarmaciaAQuitar);
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
}
    
    
