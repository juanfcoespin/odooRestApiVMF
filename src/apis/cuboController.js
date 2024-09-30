const {Router} = require('express');
const cuboBusiness = require('../business/cuboBusiness');
const router = Router();

router.get('/getMedicos', (req, res)=>{
    cuboBusiness.getMedicos().then(me=>{
        res.send(me);
    });
});
module.exports = router;