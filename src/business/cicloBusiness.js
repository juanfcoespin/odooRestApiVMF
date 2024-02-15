const dbUtils = require('../utils/dbUtils');
async function getCicloActual(){
    var sql=`
    select 
     id,
     name,
     to_char(fecha_inicio, 'yyyy-mm-dd') "fechaInicio",
     to_char(fecha_fin , 'yyyy-mm-dd') "fechaFin" 
    from tt_visitas_ciclo_promocional
    where
     current_Date between fecha_inicio and fecha_fin
     and activo = true
    limit 1
    `;
    return await dbUtils.getItem(sql);
}
module.exports={
    getCicloActual,
}