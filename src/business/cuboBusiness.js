const dbUtils = require('../utils/dbUtils');
const fechaUtils = require('../utils/fechaUtils');

async function getMedicos(){
    try{
        var sql=`
        select * from vmf_vw_medicos
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getMedicos() '+e
        };
    }
}
async function getCabeceraPedidos(){
    try{
        var sql=`
        select * from vmf_vw_pedidos
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getCabeceraPedidos() '+e
        };
    }
}
async function getLineaPedidos(){
    try{
        var sql=`
        select * from vmf_vw_linea_pedidos
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getLineaPedidos() '+e
        };
    }
}
async function getFacturaPedido(){
    try{
        var sql=`
        select * from vmf_vw_factura_pedido
        `;
        return await dbUtils.getRows(sql);
        
    }catch(e){
        return {
            "error": '\r\n'+'getFacturaPedido() '+e
        };
    }
}

module.exports={
    getMedicos,
    getCabeceraPedidos,
    getLineaPedidos,
    getFacturaPedido,
}