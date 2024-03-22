const conf = require('../config');
const dbUtils = require('../utils/dbUtils');
const sensorBusiness = require('./sensorBusiness');


async function save(me){
    try{
        var ms=[];
        //odoo maneja la hora utf, para traer la fecha actual hay que hacer lo siguiente
        var idSensor = await sensorBusiness.getId(me);
        for(var item of me.valores){
            await saveItem(item, ms, idSensor);
        }
        return ms;
    }catch(e){
        console.log(e);
        return {
            "error": '\r\n'+'valoresSensorBusiness.save(): '+e
        };
    }
}
async function saveItem(item, ms, idSensor){
    //- interval '${conf.confGlobal.zonaHorariaUTF} hour'
    //const fecha=`to_date('${item.fecha}', 'yyyy-mm-dd HH:MI:SS')`;
    //const fecha=`to_timestamp('${item.fecha}','yyyy-mm-dd HH:MI:SS') - interval '-5 hour'`
    const fecha=`'${item.fecha}' - interval '-5 hour'`
    var sql=`
    insert into tt_sitrad_medicion_sensor(area_sensor_id, valor, fecha)
    values($1, $2, $3);
    `;
    var params=[idSensor, item.valor, item.fecha];
    try{
        var insertado = await dbUtils.execute(sql, params);
        ms.push({id: item.id, resp:insertado});
    }catch(e){
        ms.push({id: item.id, resp:false, error:e});
    }
}

module.exports={
    save,
}
    
    
