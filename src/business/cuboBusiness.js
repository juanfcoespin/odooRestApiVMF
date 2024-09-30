const dbUtils = require('../utils/dbUtils');
const fechaUtils = require('../utils/fechaUtils');

async function getMedicos(){
    try{
        var sql=`
        select * from vmf_vw_medicos
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getMedicos() '+e
        };
    }
    
}

module.exports={
    getMedicos,
}