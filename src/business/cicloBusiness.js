const dbUtils = require('../utils/dbUtils');
const fechaUtils = require('../utils/fechaUtils');
async function getCicloActual(){
    try{
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
        var cicloActual = await dbUtils.getItem(sql);
        if(cicloActual){
            diaCicloActual = getDiaCicloActual(cicloActual.fechaInicio);
            cicloActual.diaCicloActual = diaCicloActual;
        }
        return cicloActual;
    }catch(e){
        return {
            "error": '\r\n'+'getCicloActual() '+e
        };
    }
    
}
function getDiaCicloActual(fechaInicio){
    if(!fechaInicio)
        throw('\r\ngetDiaCicloActual(): No se ha especificado Fecha de inicio de ciclo');
    var diaCiclo=0;
    var fechaActual = fechaUtils.obtenerFechaActual();
    var fechaDiaCiclo = fechaUtils.getDateFromStrDate(fechaInicio);
    while(fechaDiaCiclo<=fechaActual){
        fechaDiaCiclo.setDate(fechaDiaCiclo.getDate()+1); 
        if(fechaUtils.esDiaLaboral(fechaDiaCiclo))
            diaCiclo++;
    } 
    return diaCiclo;
}

module.exports={
    getCicloActual,
}