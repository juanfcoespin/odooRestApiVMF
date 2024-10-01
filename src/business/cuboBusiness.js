const dbUtils = require('../utils/dbUtils');

async function getDataCubo(vista){
    try{
        var sql="select * from "+vista;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error en la vista": '\r\n'+vista+': '+e
        };
    }
}

module.exports={
    getDataCubo,
}