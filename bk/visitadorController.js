const {Router} = require('express');
const clientDb = require('../../conection');
const router = Router();

router.get('/getByMail/:email', (req, res)=>{
    const email = req.params.email;
    var sql=`select * from tt_visitas_visitador where email='${email}' limit 1`;
    clientDb.query(sql,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
});

router.get('/getRutasByIdVisitador/:idVisitador', (req, res)=>{
    const idVisitador = parseInt(req.params.idVisitador);
    var sql=`
       select 
        t0.dia_ciclo "diaCiclo",
        t2.id "idUnidadVisita",
        t2.name "unidadVisita",
        'medico' tipo
       from tt_visitas_ruta t0 left join
        tt_visitas_medico_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
        tt_visitas_medico t2 on t2.id=t1.tt_visitas_medico_id
       union all  
       select
        t0.dia_ciclo "diaCiclo",
        t2.id "idUnidadVisita",
        t2.name "unidadVisita",
        'farmacia' tipo
       from tt_visitas_ruta t0 inner join
        tt_visitas_farmacia_tt_visitas_ruta_rel t1 on t1.tt_visitas_ruta_id=t0.id inner join
        tt_visitas_farmacia t2 on t2.id = t1.tt_visitas_farmacia_id
       where 
        visitador_id=${idVisitador} 
       order by 1
    `;
    clientDb.query(sql,(err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
});
module.exports = router;