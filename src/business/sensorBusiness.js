const dbUtils = require('../utils/dbUtils');
const areaBusiness = require('./areaBusiness');
const tipoSensorBusiness = require('./tipoSensorBusiness');

async function getId(me){
    try{
        if(!await existe(me))
            await save(me);
        var sql=`
        select 
         t0.id
        from tt_sitrad_area_sensor t0 inner join
         tt_sitrad_area t1 on t1.id=t0.area_id
        where
         t1.mac_sitrad = '${me.area.mac}'
         and t0.id_sensor_sitrad = ${me.sensor.id}
        `;
        params = [me.area.mac, me.sensor.id];
        var resp = await dbUtils.getItem(sql);
        if(resp && resp.id>0)
            return resp.id;
        else 
            throw('No existe el id del sensor!!');
        
    }catch(e){
        throw('\r\n'+'sensorBusiness.getId() '+e);
    }
}
async function existe(me){
    try{
        var sql=`
        select 
         count(*) num
        from tt_sitrad_area_sensor t0 inner join
         tt_sitrad_area t1 on t1.id=t0.area_id
        where
         t1.mac_sitrad = $1
         and t0.id_sensor_sitrad = $2
        `;
        var params=[me.area.mac, me.sensor.id];
        var resp = await dbUtils.getItem(sql, params);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\n'+'sensorBusiness.existe() '+e);
    }
}
async function save(me){
    try{
        const idArea = await areaBusiness.getId(me);
        const idTipoSensor = await tipoSensorBusiness.getId(me);
        var sql=`
            insert into tt_sitrad_area_sensor(area_id, tipo_sensor_id, name, id_sensor_sitrad)
            values($1, $2, $3, $4);
            `;
        var params=[idArea, idTipoSensor, me.sensor.nombre, me.sensor.id];
        await dbUtils.execute(sql, params);
    }catch(e){
        throw('\r\nsensorBusiness.save()'+e)
    }
}
module.exports={
    getId,
}