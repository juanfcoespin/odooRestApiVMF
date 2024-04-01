const dbUtils = require('../utils/dbUtils');
async function existe(me){
    try{ //existe única mac por área
        var sql=`
            select count(*) num
            from tt_sitrad_area
            where 
             name = $1
        `;
        const resp= await dbUtils.getItem(sql,[me.area]);
        return (resp && resp.num>0);
    }catch(e){
        throw('\r\nareaBusiness.existe()'+e);
    }
}
async function save(me){
    try{    
    var sql=`
        insert into tt_sitrad_area(name)
        values($1);
    `;
    var params=[me.area];
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
            where 
             name = $1
        `;
        const resp= await dbUtils.getItem(sql,[me.area]);
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