const dbUtils = require('../utils/dbUtils');
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
        return 0;
    var diaCiclo=0;
    
    var fechaActual = obtenerFechaActual();
    //throw(fechaActual);
    var fechaDiaCiclo = getDateFromStrDate(fechaInicio);
    while(fechaDiaCiclo<=fechaActual){
        fechaDiaCiclo.setDate(fechaDiaCiclo.getDate()+1); 
        if(esDiaLaboral(fechaDiaCiclo))
            diaCiclo++;
    } 
    return diaCiclo;
}
function getDateFromStrDate(strDate){ //yyyy-mm-dd
    //throw(strDate);
    var año= parseInt(strDate.substring(0,4));
    //throw(año);
    var mes= parseInt(strDate.substring(5,7));
    //throw(mes);
    var dia= parseInt(strDate.substring(8,10));
    //throw(dia);
    var ms= new Date(año, mes, dia);
    throw(ms);
    return ms;

}
function obtenerFechaActual() {
    var fecha = new Date();
    var año = fecha.getFullYear();
    var mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 ya que los meses van de 0 a 11
    var dia = fecha.getDate().toString().padStart(2, '0');
    return new Date(año,mes,dia);
}

function esDiaLaboral(fecha){
    return fecha.getDay() >= 1 && fecha.getDay() <= 5;
}
module.exports={
    getCicloActual,
}