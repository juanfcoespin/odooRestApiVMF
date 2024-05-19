const {Router} = require('express');
const farmaciaBusiness = require('../business/farmaciaBusiness');
const router = Router();

router.get('/getByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    farmaciaBusiness.getFarmaciasByEmailRepresentante(email).then(me=>{
        res.send(me);
    });
});
router.get('/getEspaciosContratados', (req, res)=>{
    farmaciaBusiness.getEspaciosContratados().then(me=>{
        res.send(me);
    });
});
module.exports = router;