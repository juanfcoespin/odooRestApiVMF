const {Router} = require('express');
const controller = require('./controller');
const router = Router();

router.get('/getall', controller.getMedicos);
router.get('/:id', controller.getMedicoById);
module.exports = router;