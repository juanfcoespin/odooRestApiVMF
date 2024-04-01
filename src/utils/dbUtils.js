const conf = require('../config');
const {Client} = require('pg');
async function query(sql, params=null){
    const clientDb=new Client(conf.confDb);
    try{
        await clientDb.connect();
        const ms = (params) ? await clientDb.query(sql, params) : await clientDb.query(sql);
        return ms;
    }catch(e){
        var error='\r\ndbUtils.query()\r\nError interno en la bdd: ';
        if(e && e.routine)
            error+="\r\nError: "+e.routine;
        error+='\r\nsql: '+sql;
        console.log(error);
        throw(error);
    }finally{
        await clientDb.end();
    }
}
async function getRows(sql, params=null){
    try{
        const ms= await query(sql, params);
        return ms.rows;
    }catch(e){
        throw('\r\ndbUtils.getRows()'+e);
    }
    
}
async function execute(sql, params){
    try{
        const ms= await query(sql, params);
        return (ms.rowCount>0)?true:false;
    }catch(e){
        throw('\r\ndbUtils.execute()'+e);
    }
}
async function getItem(sql, params=null){
    try{
        const matrix = await getRows(sql, params);
        if(matrix && matrix.length>0)
         return matrix[0];
        return null; 
    }catch(e){
        throw('\r\ndbUtils.getItem()'+e);
    }
}
module.exports={
    getRows,
    getItem,
    execute,
}