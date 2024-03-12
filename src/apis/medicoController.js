const {Router} = require('express');
const medicoBusiness = require('../business/medicoBusiness');
const router = Router();

router.get('/getByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    medicoBusiness.getMedicosByEmailRepresentante(email).then(me=>{
        res.send(me);
    });
});
module.exports = router;