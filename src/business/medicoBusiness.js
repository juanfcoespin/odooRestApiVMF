const dbUtils = require('../utils/dbUtils');
async function getMedicosByEmailRepresentante(email){
    try{
        var sql=`
       select
        t0.id,
        t0.name medico,
        t0.categoria,
        t0.cedula,
        t0.especialidad_id,
        t2.name especialidad,
        t1.name ciudad,
        t0.celular,
        t0.telefono_consultorio,
        t0.email,
        t0.direccion,
        t0.horario_atencion,
        t0.fecha_nacimiento,
        t0.latitud,
        t0.longitud
       from
        tt_visitas_medico t0 inner join
        tt_base_ciudad t1 on t1.id=t0.ciudad_id inner join
        tt_visitas_especialidad t2 on t2.id=t0.especialidad_id
       where
        t0.id in(
           select 
            distinct(t3.tt_visitas_medico_id)
           from 
            tt_visitas_medico_tt_visitas_ruta_rel t3 inner join
            tt_visitas_ruta t4 on t4.id=t3.tt_visitas_ruta_id  inner join
            tt_visitas_representante t5 on t5.id=t4.representante_id
           where
            t5.email=$1 
        )
        order by 
         t0.name
        `;
        return await dbUtils.getRows(sql,[email]);
    }catch(e){
        return{
            "error": '\r\getMedicosByEmailRepresentante'+e
        };
    }
}
module.exports={
    getMedicosByEmailRepresentante,
}