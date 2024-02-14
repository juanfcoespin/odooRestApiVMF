const dbUtils = require('../utils/dbUtils');

async function getRutasByIdVisitador(idVisitador){
    var sql=`
    select 
     tx.dia_ciclo "diaCiclo",
     tx.id "idUnidadVisita",
     tx.name "unidadVisita",
     tx.tipo
    from
    (
       select 
        t0.dia_ciclo,
        t2.id,
        t2.name,
        'medico' tipo,
        t0.visitador_id
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
        'farmacia' tipo,
        t0.visitador_id
       from tt_visitas_ruta t0 inner join
        tt_visitas_farmacia_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
        tt_visitas_farmacia t2 on t2.id = t1.tt_visitas_farmacia_id
       where
        t2.Activo=True
    ) tx
    where 
     tx.visitador_id=${idVisitador}
     order by tx.dia_ciclo
    `;
    return await dbUtils.getRows(sql);
}
async function getByMail(email){
    var sql=`select * from tt_visitas_visitador where email='${email}' limit 1`;
    return await dbUtils.getRows(sql);
}
async function getVisitasByIdCicloIdVisitador(idCiclo, idVisitador){
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
      t2.visitador_id,
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
      t2.visitador_id,
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
     tx.visitador_id=${idVisitador}
     and tx.ciclo_id=${idCiclo}
    order by
     tx.dia_ciclo
    `;
    return await dbUtils.getRows(sql);
}
async function getVisitasPendientesByIdCicloIdVisitador(idCiclo, idVisitador){
    
    var rutas = await getRutasByIdVisitador(idVisitador);
    const visitas = await getVisitasByIdCicloIdVisitador(idCiclo, idVisitador);
    visitas.forEach(visita=>{
        rutas = rutas.filter(ruta=>!(ruta.diaCiclo==visita.diaCiclo && ruta.idUnidadVisita==visita.idUnidadVisita && ruta.tipo==visita.tipo));
    });
    return rutas;
}
module.exports={
    getRutasByIdVisitador,
    getByMail,
    getVisitasByIdCicloIdVisitador,
    getVisitasPendientesByIdCicloIdVisitador
}
    
    
