const {Router} = require('express');
const clientDb = require('../../conection');
const router = Router();

router.get('/', (req, res)=>{
    var sql='select id, name from tt_visitas_medico';
    clientDb.query(sql,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
});
router.get('/getById/:id', (req, res)=>{
    const id = parseInt(req.params.id);
    var sql='select id, name from tt_visitas_medico where id='+id;
    clientDb.query(sql,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
});
module.exports = router;