const dbUtils = require('../utils/dbUtils');
async function getDistribuidores(){
    try{
        var sql=`
        select id, name from tt_base_contacto
        `;
       
        return await dbUtils.getRows(sql);
    }catch(e){
        return{
            "error": '\r\ngetDistribuidores'+e
        };
    }
}
module.exports={
    getDistribuidores,
}