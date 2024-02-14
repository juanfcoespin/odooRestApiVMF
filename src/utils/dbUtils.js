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
module.exports={
    getRows,
}