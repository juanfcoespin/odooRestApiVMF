const dbUtils = require('../utils/dbUtils');
const areaBusiness = require('./areaBusiness');
const tipoSensorBusiness = require('./tipoSensorBusiness');

async function getId(me){
    try{
        const idTipoSensor = await tipoSensorBusiness.getId(me);
        me.sensor.idTipoSensor=idTipoSensor;
        if(!await existe(me)){
            console.log('a guardar sensor!!');
            await save(me);
        }
            
        var sql=`
        select 
         t0.id
        from tt_sitrad_area_sensor t0 inner join
         tt_sitrad_area t1 on t1.id=t0.area_id
         where
         t0.name = $1
         and t1.name= $2
         and t0.tipo_sensor_id = $3
        `;
        var params=[me.sensor.nombre,me.area, me.sensor.idTipoSensor];
        var resp = await dbUtils.getItem(sql, params);
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
         t0.name = $1
         and t1.name= $2
         and t0.tipo_sensor_id = $3
        `;
        var params=[me.sensor.nombre,me.area, me.sensor.idTipoSensor];
        console.log(sql);
        console.log(params);
        var resp = await dbUtils.getItem(sql, params);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\n'+'sensorBusiness.existe() '+e);
    }
}
async function save(me){
    try{
        const idArea = await areaBusiness.getId(me);
        
        var sql=`
            insert into tt_sitrad_area_sensor(area_id, tipo_sensor_id, name)
            values($1, $2, $3);
            `;
        var params=[idArea, me.sensor.idTipoSensor, me.sensor.nombre];
        await dbUtils.execute(sql, params);
    }catch(e){
        throw('\r\nsensorBusiness.save()'+e)
    }
}
module.exports={
    getId,
}