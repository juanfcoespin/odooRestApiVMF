const {Router} = require('express');
const pedidoBusiness = require('../business/pedidoBusiness');
const router = Router();

router.post('/savePedidos', (req, res)=>{
    const pedidos = req.body;
    pedidoBusiness.savePedidos(pedidos).then(me=>{
        res.send(me);
    });
});
//se utiliza para el catálogo
router.get('/getByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    const filtro={};
    filtro.email=email;
    pedidoBusiness.getByFiltro(filtro).then(me=>{
        res.send(me);
    });
});
router.post('/getByFiltro', (req, res)=>{
    const filtro = req.body;
    pedidoBusiness.getByFiltro(filtro).then(me=>{
        res.send(me);
    });
});
module.exports = router;