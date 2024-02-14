const dbUtils = require('../utils/dbUtils');
async function getMedicos(){
    var sql='select id, name from tt_visitas_medico';
    return await dbUtils.getRows(sql);
}
async function getById(id){
    var sql=`select id, name from tt_visitas_medico where id=${id}`;
    return await dbUtils.getRows(sql);
}
module.exports={
    getMedicos,
    getById,
}