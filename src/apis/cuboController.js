const {Router} = require('express');
const cuboBusiness = require('../business/cuboBusiness');
const router = Router();

router.get('/getMedicos', (req, res)=>{
    cuboBusiness.getMedicos().then(me=>{
        res.send(me);
    });
});
router.get('/getCabeceraPedidos', (req, res)=>{
    cuboBusiness.getCabeceraPedidos().then(me=>{
        res.send(me);
    });
});
router.get('/getLineaPedidos', (req, res)=>{
    cuboBusiness.getLineaPedidos().then(me=>{
        res.send(me);
    });
});
router.get('/getFacturaPedido', (req, res)=>{
    cuboBusiness.getFacturaPedido().then(me=>{
        res.send(me);
    });
});

module.exports = router;