const {Router} = require('express');
const medicoBusiness = require('../business/medicoBusiness');
const router = Router();


router.get('/', (req, res)=>{
    medicoBusiness.getMedicos().then(me=>{
        res.send(me);
    });
});
router.get('/getById/:id', (req, res)=>{
    const id = parseInt(req.params.id);
    medicoBusiness.getById(id).then(me=>{
        res.send(me);
    });
});
module.exports = router;