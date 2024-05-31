const {Router} = require('express');
const articuloBusiness = require('../business/articuloBusiness');
const router = Router();

router.get('/getInventarioByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    articuloBusiness.getInventarioByMailRepresentante(email).then(me=>{
        res.send(me);
    });
});
router.get('/getArticulosVenta', (req, res)=>{
    articuloBusiness.getArticulosVenta().then(me=>{
        res.send(me);
    });
});
router.get('/getArticulosCompetencia', (req, res)=>{
    articuloBusiness.getArticulosCompetencia().then(me=>{
        res.send(me);
    });
});
router.get('/getMaterialPromocional', (req, res)=>{
    articuloBusiness.getMaterialPromocional().then(me=>{
        res.send(me);
    });
});
router.get('/getEspecialidades', (req, res)=>{
    articuloBusiness.getEspecialidades().then(me=>{
        res.send(me);
    });
});
module.exports = router;