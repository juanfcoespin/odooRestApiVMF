
const clientDb = require('../../conection');
clientDb.connect();
const getMedicos=(req, resp)=>{
    var sql='select id, name from tt_visitas_medico';
    clientDb.query(sql,(err, result)=>{
        if(!err){
            resp.send(result.rows);
        }
    });
};
const getMedicoById=(req, resp)=>{
    const id = parseInt(req.params.id);
    var sql='select id, name from tt_visitas_medico where id='+id;
    clientDb.query(sql,(err, result)=>{
        if(!err){
            resp.send(result.rows);
        }
    });
};
module.exports={
    getMedicos,
    getMedicoById,
};