const dbUtils = require('../utils/dbUtils');

async function getInventarioByMailRepresentante(email){
    try{
        var sql=`
        select
         t3.id "idArticulo",
         t3.name articulo,
         t4.name "tipoArticulo",
         t4.orden "tipoArticuloOrden",
         sum(t2.cantidad) "cantidad"
        from
         tt_visitas_inventario t2  inner join
         tt_visitas_representante t1 on t1.id=t2.bodega_id inner join
         tt_visitas_articulo t3 on t3.id=t2.articulo_id inner join
         tt_visitas_tipo_articulo t4 on t4.id=t3.tipo_articulo_id
        where
         t1.email=$1
         and t2.activo=true
        group by
		 t3.id,
         t3.name,
         t4.name,
         t4.orden
        order by
         t4.orden,
         t3.name
        `;
        var ms= await dbUtils.getRows(sql,[email]);
        for(let item of ms){
            item.especialidades = await getIdsEspecialidadesPorArticulo(item.idArticulo);
        }
        return ms;
    }catch(e){
        return{
            "error": '\r\ngetInventarioByMailRepresentante'+e
        };
    }
}
async function getIdsEspecialidadesPorArticulo(idArticulo){
    try{
        var sql=`
        select
         distinct(especialidad_id) id
        from
            tt_visitas_especialidad_medica_articulo
        where 
            articulo_id=$1
        `;
        var items= await dbUtils.getRows(sql,[idArticulo]);
        var ms=[];
        items.forEach(item => {
            ms.push(item.id);
        });
        return ms;
    }catch(e){
        throw('getIdsEspecialidadesPorArticulo: '+e)
    }
}
async function getEspecialidades(idArticulo){
    try{
        var sql=`
        select
           id, name
        from
            tt_visitas_especialidad
        `;
        return await dbUtils.getRows(sql);
    }catch(e){
        throw('getIdsEspecialidadesPorArticulo: '+e)
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
async function getArticulosCompetencia(){
    try{
        var sql=`
        select
         t0.id,
         t0.name
        from
         tt_visitas_articulo t0 inner join
         tt_visitas_tipo_articulo t1 on t1.id=t0.tipo_articulo_id
        where
         t1.name='Producto Competencia' 
        `;

        return await dbUtils.getRows(sql);
    }catch(e){
        return{
            "error": '\r\getMedicosByEmailRepresentante'+e
        };
    }
}
async function getMaterialPromocional(){
    try{
        var sql=`
            select id,name from tt_visitas_espacio_contratado
        `;

        return await dbUtils.getRows(sql);
    }catch(e){
        return{
            "error": '\r\ngetMedicosByEmailRepresentante'+e
        };
    }
}

module.exports={
    getInventarioByMailRepresentante,
    getArticulosVenta,
    getMaterialPromocional,
    getArticulosCompetencia,
    getEspecialidades,
}