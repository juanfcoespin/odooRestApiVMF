const dbUtils = require('../utils/dbUtils');


async function getId(me){
    try{
        if(!await existe(me))
            await save(me);
        var sql=`
            select id from tt_sitrad_unidad_medida
            where name = $1
        `;
        const resp=await dbUtils.getItem(sql, [me.sensor.unidad]);
        if(resp && resp.id)
            return resp.id;
        throw(' No existe el tipo sensor: '+me.sensor.tipo);
    }catch(e){
        throw('\r\nunidadMedidaBusiness.getId()'+e);
    }
}
async function existe(me){
    try{
        var sql=`
            select count(*) num from tt_sitrad_unidad_medida
            where name = $1
        `;
        const resp=await dbUtils.getItem(sql, [me.sensor.unidad]);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\nunidadMedidaBusiness.existe()'+e);
    }
}
async function save(me){
    try{
        var sql=`
            insert into tt_sitrad_unidad_medida(name)
            values($1);
            `;
        var params=[me.sensor.unidad];
        await dbUtils.execute(sql, params);
    }catch(e){
        throw('\r\nunidadMedidaBusiness.save()'+e)
    }
}
module.exports={
    getId,
}