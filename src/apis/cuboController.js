const {Router} = require('express');
const cuboBusiness = require('../business/cuboBusiness');
const router = Router();

router.get('/getMedicos', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_medicos').then(me=>{
        res.send(me);
    });
});
router.get('/getCabeceraPedidos', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_pedidos').then(me=>{
        res.send(me);
    });
});
router.get('/getLineaPedidos', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_linea_pedidos').then(me=>{
        res.send(me);
    });
});
router.get('/getFacturaPedido', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_factura_pedido').then(me=>{
        res.send(me);
    });
});
router.get('/getRepresentante', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_representante').then(me=>{
        res.send(me);
    });
});
router.get('/getFarmacia', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_farmacia').then(me=>{
        res.send(me);
    });
});
router.get('/getVisitaMedicoCabecera', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_visita_medico').then(me=>{
        res.send(me);
    });
});
router.get('/getVisitaMedicoLinea', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_visita_medico_linea').then(me=>{
        res.send(me);
    });
});
router.get('/getVisitaFarmaciaCabecera', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_visita_farmacia').then(me=>{
        res.send(me);
    });
});
router.get('/getVisitaFarmaciaLinea', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_visita_farmacia_linea').then(me=>{
        res.send(me);
    });
});
router.get('/getControlExhibicionFarmacia', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_control_exhibicion_farmacia').then(me=>{
        res.send(me);
    });
});
router.get('/getInventarioActivo', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_inventario_activo').then(me=>{
        res.send(me);
    });
});
router.get('/getMetasRepresentante', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_metas_representante').then(me=>{
        res.send(me);
    });
});
router.get('/getRutaRepresentante', (req, res)=>{
    cuboBusiness.getDataCubo('vmf_vw_ruta_representante').then(me=>{
        res.send(me);
    });
});

module.exports = router;