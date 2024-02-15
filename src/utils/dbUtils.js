const conf = require('../config');
const {Client} = require('pg');
async function getRows(sql){
    const clientDb=new Client(conf);
    try{
        await clientDb.connect();
        const ms = await clientDb.query(sql);
        return ms.rows;
    }catch(err){
        throw err;
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
module.exports={
    getRows,
    getItem,
}