const dbUtils = require('../utils/dbUtils');
const unidadMedidaBusiness = require('./unidadMedidadBusiness');

async function getId(me){
    try{
        if(!await existe(me))
            await save(me);
        var sql=`
            select id from tt_sitrad_tipo_sensor
            where name = $1
        `;

        const resp=await dbUtils.getItem(sql, [me.sensor.tipo]);
        if(resp && resp.id)
            return resp.id;
        throw(' No existe el tipo sensor: '+me.sensor.tipo);
    }catch(e){
        throw('\r\ntipoSensorBusiness.getId()'+e);
    }
}
async function existe(me){
    try{
        var sql=`
            select count(*) num from tt_sitrad_tipo_sensor
            where name = $1
        `;
        const resp=await dbUtils.getItem(sql, [me.sensor.tipo]);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\ntipoSensorBusiness.existe()'+e);
    }
}
async function save(me){
    try{
        const idUnidad = await unidadMedidaBusiness.getId(me);
        var sql=`
            insert into tt_sitrad_tipo_sensor(name, unidad_medida_id)
            values($1, $2);
            `;
        var params=[me.sensor.tipo, idUnidad];
        await dbUtils.execute(sql, params);
    }catch(e){
        throw('\r\ntipoSensorBusiness.save()'+e)
    }
}
module.exports={
    getId,
}