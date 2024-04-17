const dbUtils = require('../utils/dbUtils');
async function getInventarioByMailRepresentante(email){
    try{
        var sql=`
        select
         t3.id "idArticulo",
         t3.name articulo,
         t4.name "tipoArticulo",
         sum(t2.cantidad) "cantidad"
        from
         tt_visitas_bodega t0 inner join
         tt_visitas_representante t1 on t1.id=t0.responsable_id inner join
         tt_visitas_inventario t2 on t2.bodega_id=t0.id inner join
         tt_visitas_articulo t3 on t3.id=t2.articulo_id inner join
         tt_visitas_tipo_articulo t4 on t4.id=t3.tipo_articulo_id
        where
         t1.email=$1
         and t2.activo=true
        group by
		 t3.id,
         t3.name,
         t4.name
        `;
        
        return await dbUtils.getRows(sql,[email]);
    }catch(e){
        return{
            "error": '\r\getMedicosByEmailRepresentante'+e
        };
    }
}
async function getArticulosVenta(){
    try{
        var sql=`
        select
         t0.id,
         t0.name,
         t0.precio
        from
         tt_visitas_articulo t0 inner join
         tt_visitas_tipo_articulo t1 on t1.id=t0.tipo_articulo_id
        where
         t1.name='Producto Terminado' 
        `;

        return await dbUtils.getRows(sql);
    }catch(e){
        return{
            "error": '\r\getMedicosByEmailRepresentante'+e
        };
    }
}

module.exports={
    getInventarioByMailRepresentante,
    getArticulosVenta,
}