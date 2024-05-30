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
            diaCicloActual = await getDiaCicloActual(cicloActual);
            cicloActual.diaCicloActual = diaCicloActual;
        }
        return cicloActual;
    }catch(e){
        return {
            "error": '\r\n'+'getCicloActual() '+e
        };
    }
    
}
async function getDiaCicloActual(cicloActual){
    if(!cicloActual)
        throw('\r\ngetDiaCicloActual(): No se ha especificado el ciclo actual');
    if(!cicloActual.fechaInicio)
        throw('\r\ngetDiaCicloActual(): No se ha especificado Fecha de inicio de ciclo');
    var diaCiclo=0;
    var fechaActual = fechaUtils.obtenerFechaActual();
    var fechaDiaCiclo = fechaUtils.getDateFromStrDate(cicloActual.fechaInicio);
    while(fechaDiaCiclo<=fechaActual){
        fechaDiaCiclo.setDate(fechaDiaCiclo.getDate()+1); 
        if(fechaUtils.esDiaLaboral(fechaDiaCiclo))
            diaCiclo++;
    } 
    var diasFeriadoEnCiclo = await getDiasFeriadoEnCiclo(cicloActual.id)
    if(diasFeriadoEnCiclo<diaCiclo)
        diaCiclo-=diasFeriadoEnCiclo;
    return diaCiclo;
}
async function getDiasFeriadoEnCiclo(idCiclo){
    try{
        var sql=`
            select 
                count(*) num
            from
                tt_visitas_ciclo_promocional_feriados
            where
                ciclo_id=$1
        `;
        var ms= await dbUtils.getItem(sql, [idCiclo]);
        if(ms)
            return ms.num;
        return 0;
    }catch(e){
        throw('getDiasFeriadoEnCiclo: No se pudo extraer los feriados')
    }
}
async function getCiclos(){
    try{
        var sql=`
        select 
         id,
         activo,
         name,
         to_char(fecha_inicio, 'yyyy-mm-dd') "fechaInicio",
         to_char(fecha_fin , 'yyyy-mm-dd') "fechaFin" 
        from tt_visitas_ciclo_promocional
        order by
         fecha_inicio desc
        limit 12
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getCiclos() '+e
        };
    }
    
}

module.exports={
    getCicloActual,
    getCiclos,
}