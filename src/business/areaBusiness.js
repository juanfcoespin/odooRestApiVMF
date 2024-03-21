const dbUtils = require('../utils/dbUtils');
async function existe(me){
    try{ //existe única mac por área
        var sql=`
            select count(*) num
            from tt_sitrad_area
            where mac_sitrad = $1 
        `;
        const resp= await dbUtils.getItem(sql,[me.area.mac]);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\nareaBusiness.existe()'+e);
    }
}
async function save(me){
    try{    
    var sql=`
        insert into tt_sitrad_area(name, id_area_sitrad, mac_sitrad)
        values($1, $2, $3);
    `;
    var params=[me.area.nombre, me.area.id, me.area.mac];
    await dbUtils.execute(sql, params);
    }catch(e){
        throw('\r\nareaBusiness.save()'+e);
    }
}
async function getId(me){
    try{
        if(! await existe(me))
            await save(me);
        var sql=`
            select id from tt_sitrad_area
            where mac_sitrad = $1 
        `;
        const resp= await dbUtils.getItem(sql,[me.area.mac]);
        if(resp && resp.id)
            return resp.id;
        throw('No existe area con la mac: '+me.area.mac);
    }catch(e){
        throw('\r\nareaBusiness.getId()'+e);
    }
}
module.exports={
    getId,
}