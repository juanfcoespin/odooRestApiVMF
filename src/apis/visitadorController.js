const {Router} = require('express');
const visitadorBusiness = require('../business/visitadorBusiness');
const router = Router();

router.get('/getByMail/:email', (req, res)=>{
    const email = req.params.email;
    visitadorBusiness.getByMail(email).then(me=>{
        res.send(me);
    });
});
router.get('/getRutasByIdVisitador/:idVisitador', (req, res)=>{
    const idVisitador = parseInt(req.params.idVisitador);
    visitadorBusiness.getRutasByIdVisitador(idVisitador).then(me=>{
        res.send(me);
    });
});
router.post('/getVisitasByIdCicloIdVisitador', (req, res)=>{
    const idVisitador = req.body.idVisitador;
    const idCiclo = req.body.idCiclo;
    visitadorBusiness.getVisitasByIdCicloIdVisitador(idCiclo,idVisitador).then(me=>{
        res.send(me);
    });
});
router.post('/getVisitasPendientesByIdCicloIdVisitador', (req, res)=>{
    const idVisitador = req.body.idVisitador;
    const idCiclo = req.body.idCiclo;
    visitadorBusiness.getVisitasPendientesByIdCicloIdVisitador(idCiclo,idVisitador).then(me=>{
        res.send(me);
    });
});
module.exports = router;