const {Router} = require('express');
const pedidoBusiness = require('../business/pedidoBusiness');
const router = Router();

router.post('/savePedidos', (req, res)=>{
    const pedidos = req.body;
    pedidoBusiness.savePedidos(pedidos).then(me=>{
        res.send(me);
    });
});
router.get('/getByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    pedidoBusiness.getByMailRepresentante(email).then(me=>{
        res.send(me);
    });
});
router.post('/getByFiltro', (req, res)=>{
    const filtro = req.body;
    pedidoBusiness.getByMailRepresentante(filtro.email, filtro.fechaDesde, filtro.fechaHasta).then(me=>{
        res.send(me);
    });
});
module.exports = router;