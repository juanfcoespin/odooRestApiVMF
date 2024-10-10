const {Router} = require('express');
const visitadorBusiness = require('../business/visitadorBusiness');
const router = Router();

router.get('/getByMail/:email', (req, res)=>{
    const email = req.params.email;
    visitadorBusiness.getByMail(email).then(me=>{
        res.send(me);
    });
});
router.post('/getVisitasByIdCicloYEmail', (req, res)=>{
    visitadorBusiness.getVisitasByIdsCicloEmailRepresentanteConLineas(req.body).then(me=>{
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
router.post('/saveVisitas', (req, res)=>{
    const visitas = req.body;
    visitadorBusiness.saveVisitas(visitas).then(me=>{
        res.send(me);
    });
});
router.post('/tmp', (req, res)=>{
    const me = req.body;
    visitadorBusiness.VisitaMedicoEnCicloRegistrada(me.idRepresentante, me.idCiclo, me.idMedico).then(me=>{
        res.send(me);
    });
});
router.post('/savePedidos', (req, res)=>{
    const pedidos = req.body;
    visitadorBusiness.savePedidos(pedidos).then(me=>{
        res.send(me);
    });
});
router.get('/getVisitasPendientesByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    visitadorBusiness.getVisitasPendientesByEmailRepresentante(email).then(me=>{
        res.send(me);
    });
});
router.get('/getVisitasCicloAnteriorByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    visitadorBusiness.getVisitasCiclosAnteriorByEmailRepresentante(email).then(me=>{
        res.send(me);
    });
});
module.exports = router;