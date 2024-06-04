const {Router} = require('express');
const cicloBusiness = require('../business/cicloBusiness');
const router = Router();

router.get('/getCiclos', (req, res)=>{
    cicloBusiness.getCiclos().then(me=>{
        res.send(me);
    });
});
router.get('/getCicloActual', (req, res)=>{
    cicloBusiness.getCicloActual().then(me=>{
        res.send(me);
    });
});
module.exports = router;