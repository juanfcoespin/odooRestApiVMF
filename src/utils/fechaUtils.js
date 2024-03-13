function getDateFromStrDate(strDate){ //yyyy-mm-dd
    var año= parseInt(strDate.substring(0,4));
    var mes= parseInt(strDate.substring(5,7))-1; //por alguna razon en js los meses empiezan por 0
    var dia= parseInt(strDate.substring(8,10));
    var ms= new Date(año, mes, dia);
    return ms;
}
function obtenerFechaActual() {
    var fecha = new Date();
    var año = fecha.getFullYear();
    var mes = fecha.getMonth();
    var dia = fecha.getDate();
    return new Date(año,mes,dia);
}
function esDiaLaboral(fecha){
    return fecha.getDay() >= 1 && fecha.getDay() <= 5;
}
module.exports={
    getDateFromStrDate,
    obtenerFechaActual,
    esDiaLaboral,
}