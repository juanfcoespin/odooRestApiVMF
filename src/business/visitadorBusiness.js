const dbUtils = require('../utils/dbUtils');
const cicloBusiness = require('./cicloBusiness');

async function getRutasByIdRepresentante(idRepresentante){
    try{
        var sql=`
        select 
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
            t0.dia_ciclo,
            t2.id,
            t2.name,
            t2.direccion,
            t2.latitud,
            t2.longitud,
            'medico' tipo,
            t0.representante_id
           from tt_visitas_ruta t0 inner join
            tt_visitas_medico_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
            tt_visitas_medico t2 on t2.id=t1.tt_visitas_medico_id
           where
            t2.Activo=True
           union all  
           select
            t0.dia_ciclo,
            t2.id,
            t2.name,
            t2.direccion,
            t2.latitud,
            t2.longitud,
            'farmacia' tipo,
            t0.representante_id
           from tt_visitas_ruta t0 inner join
            tt_visitas_farmacia_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
            tt_visitas_farmacia t2 on t2.id = t1.tt_visitas_farmacia_id
           where
            t2.Activo=True
        ) tx
        where 
         tx.representante_id=${idRepresentante}
         order by tx.dia_ciclo
        `;
    }catch(e){
        return {
            "error": '\r\ngetRutasByIdVisitador: '+e
        }
    }
    
    return await dbUtils.getRows(sql);
}
async function getByMail(email){
    try{
        var sql=`
        select 
            t0.id,
            t1.name tipo_representante,
            t0.meta_compra_ciclo,
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
async function getVisitasByIdCicloIdRepresentante(idCiclo, idRepresentante){
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
          tt_visitas_medico t3 on t3.id=t0.medico_id
         where
          t1.activo=True
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
          tt_visitas_farmacia t3 on t3.id=t0.farmacia_id
         where
          t1.activo=True
        ) tx
        where
         tx.representante_id=${idRepresentante}
         and tx.ciclo_id=${idCiclo}
        order by
         tx.dia_ciclo
        `;
        return await dbUtils.getRows(sql);
    }catch(e){
        return{
            "error": '\r\getVisitasByIdCicloIdRepresentante: '+e
        };
    }
}
async function getVisitasPendientesByIdRepresentante(idRepresentante){
    try{
        var cicloActual = await cicloBusiness.getCicloActual();
        if(cicloActual && cicloActual.error)
            throw(cicloActual.error);
        if(cicloActual){
            var rutas = await getRutasByIdRepresentante(idRepresentante);
            if(rutas.error)
                throw(rutas.error); 
            const visitas = await getVisitasByIdCicloIdRepresentante(cicloActual.id, idRepresentante);
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
            "error": '\r\getVisitasPendientesByIdRepresentante: '+e
        };
    }
}
module.exports={
    getRutasByIdRepresentante,
    getByMail,
    getVisitasByIdCicloIdRepresentante,
    getVisitasPendientesByIdRepresentante,
}
    
    
