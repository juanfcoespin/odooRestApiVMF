const {Router} = require('express');
const visitadorBusiness = require('../business/visitadorBusiness');
const router = Router();

router.get('/getByMail/:email', (req, res)=>{
    const email = req.params.email;
    visitadorBusiness.getByMail(email).then(me=>{
        res.send(me);
    });
});
router.get('/getRutasByIdRepresentante/:idRepresentante', (req, res)=>{
    const idRepresentante = parseInt(req.params.idRepresentante);
    visitadorBusiness.getRutasByIdRepresentante(idRepresentante).then(me=>{
        res.send(me);
    });
});
router.post('/getVisitasByIdCicloIdRepresentante', (req, res)=>{
    const idRepresentante = req.body.idRepresentante;
    const idCiclo = req.body.idCiclo;
    visitadorBusiness.getVisitasByIdCicloIdRepresentante(idCiclo,idRepresentante).then(me=>{
        res.send(me);
    });
});
router.get('/getVisitasPendientesByIdRepresentante/:idRepresentante', (req, res)=>{
    const idRepresentante = parseInt(req.params.idRepresentante);
    visitadorBusiness.getVisitasPendientesByIdRepresentante(idRepresentante).then(me=>{
        res.send(me);
    });
});
module.exports = router;