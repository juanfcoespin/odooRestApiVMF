const {Router} = require('express');
const articuloBusiness = require('../business/articuloBusiness');
const router = Router();

router.get('/getInventarioByEmailRepresentante/:email', (req, res)=>{
    const email = req.params.email;
    articuloBusiness.getInventarioByMailRepresentante(email).then(me=>{
        res.send(me);
    });
});
module.exports = router;