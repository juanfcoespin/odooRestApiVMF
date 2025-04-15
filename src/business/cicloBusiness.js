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
         (NOW() - INTERVAL '5 hours')::date between fecha_inicio and fecha_fin
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
    //console.log('fechaActual: ',fechaActual);
    //console.log('cicloActual.fechaInicio: ',cicloActual.fechaInicio);
    var fechaDiaCiclo = fechaUtils.getDateFromStrDate(cicloActual.fechaInicio);
    var diasFeriadoEnCiclo = await getDiasFeriadoEnCiclo(cicloActual.id)
    //console.log('diasFeriadoEnCiclo: ',diasFeriadoEnCiclo);
    while(fechaDiaCiclo<=fechaActual){
        //console.log('fechaDiaCiclo: ',fechaDiaCiclo);
        if(fechaUtils.esDiaLaboral(fechaDiaCiclo)){
            //si el dia no es feriado
            if(!esFeriado(fechaDiaCiclo, diasFeriadoEnCiclo)){
                diaCiclo++;
                //console.log('diaCiclo: ',diaCiclo);
            }else
                console.log('Feriado Identificado: ',fechaDiaCiclo);
            
        }
        fechaDiaCiclo.setDate(fechaDiaCiclo.getDate()+1); 
    } 
    if(diaCiclo<=0)
        return 1;
    if(diaCiclo>20)
        return 20
    console.log('Respuesta: ',diaCiclo);
    return diaCiclo;
}
function esFeriado(fechaDiaCiclo, diasFeriadoEnCiclo){
    //console.log('fechaDiaCiclo: ',fechaDiaCiclo.getTime());
    for(let fecha of diasFeriadoEnCiclo){
        //console.log('fecha: ',fecha.getTime());
        if(fecha.getTime()==fechaDiaCiclo.getTime())
            return true;
    }
    return false;
}
async function getDiasFeriadoEnCiclo(idCiclo){
    try{
        var sql=`
            select 
                fecha_feriado
            from
                tt_visitas_ciclo_promocional_feriados
            where
                ciclo_id=$1
        `;
        var ms=[];
        var matrix= await dbUtils.getRows(sql, [idCiclo]);
        for(let item of matrix){
            ms.push(item.fecha_feriado);
        }
        return ms;
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
