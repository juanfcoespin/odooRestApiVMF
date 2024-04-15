const conf = require('../config');
const {Client} = require('pg');
async function query(sql, params=null){
    const clientDb=new Client(conf.confDb);
    try{
        await clientDb.connect();
        const ms = (params) ? await clientDb.query(sql, params) : await clientDb.query(sql);
        return ms;
    }catch(e){
        //console.log(e);
        var error='\r\nError interno en la bdd: ';
        if(e && e.routine)
            error+="\r\nError: "+e.routine;
        error+='\r\nsql: '+sql;
        throw(error);
    }finally{
        await clientDb.end();
    }
}
async function getRows(sql, params=null){
    const ms= await query(sql, params);
    return ms.rows;
}
async function execute(sql, params){
    const ms= await query(sql, params);
    return (ms.rowCount>0)?true:false;
}

async function getItem(sql){
    const matrix = await getRows(sql);
    if(matrix && matrix.length>0)
     return matrix[0];
    return null; 
}
function getDateFromJs(fecha){
    if(fecha.length<10)
        return fecha;
    return "to_date('"+fecha.substring(0, 10)+"', 'yyyy-mm-dd')";
}
module.exports={
    getRows,
    getItem,
    execute,
    getDateFromJs,
}