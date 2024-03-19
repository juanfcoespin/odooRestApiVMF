const conf = require('../config');
const {Client} = require('pg');
async function getRows(sql){
    const clientDb=new Client(conf);
    try{
        await clientDb.connect();
        const ms = await clientDb.query(sql);
        return ms.rows;
    }catch(e){
        var error='\r\nError interno en la bdd: ';
        if(e && e.routine)
            error+="\r\nError: "+e.routine;
        error+='\r\nsql: '+sql;
        throw error;
    }finally{
        await clientDb.end();
    }
}
async function execute(sql){
    const clientDb=new Client(conf);
    try{
        const ms=getRows(sql);
        return (ms)?true:false;

    }catch(e){
        var error='\r\nexecute()\r\nError interno en la bdd: ';
        if(e && e.routine)
            error+="\r\nError: "+e.routine;
        error+='\r\nsql: '+sql;
        throw error;
    }finally{
        await clientDb.end();
    }
}

async function getItem(sql){
    const matrix = await getRows(sql);
    if(matrix && matrix.length>0)
     return matrix[0];
    return null; 
}
async function getScalar(sql){
    const ms = await getItem(sql);
    if(ms && ms.length>0)
     return ms[0];
    return null; 
}
module.exports={
    getRows,
    getItem,
    getScalar,
    execute,
}