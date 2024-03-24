const {Router} = require('express');
const distribuidorBusiness = require('../business/distribuidorBusiness');
const router = Router();

router.get('/getall', (req, res)=>{
    distribuidorBusiness.getDistribuidores().then(me=>{
        res.send(me);
    });
});
module.exports = router;