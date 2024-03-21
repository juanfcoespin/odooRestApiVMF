const {Router} = require('express');
const valoresSensorBusiness = require('../business/valoresSensorBusiness');
const router = Router();

router.post('/save', (req, res)=>{
    const me = req.body;
    valoresSensorBusiness.save(me).then(ms=>{
        res.send(ms);
    });
});

module.exports = router;