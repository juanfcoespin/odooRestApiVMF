const dbUtils = require('../utils/dbUtils');
async function getFarmaciasByEmailRepresentante(email){
    try{
        var sql=`
        select
        t0.id,
        t0.ruc,
        t0.name farmacia,
        t3.name "tipoFarmacia",
        t0.categoria,
        t1.name ciudad,
        t0.celular,
        t0.email,
        t0.direccion,
		t2.name "liderPunto",
		t0.cod_farmacia,
		t0.num_dependientes,
		t0.num_visitas_por_ciclo,
		t0.recibe_muestra_medica,
		t0.recibe_material_promocional,
		t0.categoria,
        t0.latitud,
        t0.longitud
       from
        tt_visitas_farmacia t0 left outer join
        tt_base_ciudad t1 on t1.id=t0.ciudad_id left outer join
		tt_base_persona_contacto t2 on t2.id=t0.lider_punto_id left outer join
        tt_visitas_tipo_farmacia t3 on t3.id=t0.tipo_farmacia_id
       where
        t0.id in(
           select 
            distinct(t3.tt_visitas_farmacia_id)
           from 
            tt_visitas_farmacia_tt_visitas_ruta_rel t3 inner join
            tt_visitas_ruta t4 on t4.id=t3.tt_visitas_ruta_id  inner join
            tt_visitas_representante t5 on t5.id=t4.representante_id
           where
            t5.email=$1 
        )
        order by 
         t0.name
        `;
        return await dbUtils.getRows(sql,[email]);
    }catch(e){
        return{
            "error": '\r\getFarmaciasByEmailRepresentante'+e
        };
    }
}
async function getEspaciosContratados(){
    try{
        var sql=`
        select
         id, name
        from 
         tt_visitas_espacio_contratado
        where
         activo=true
        `;
        return await dbUtils.getRows(sql);
    }catch(e){
        return {
            error: 'getEspaciosContratados() '+e
        }
    }
}
module.exports={
    getFarmaciasByEmailRepresentante,
    getEspaciosContratados,
}