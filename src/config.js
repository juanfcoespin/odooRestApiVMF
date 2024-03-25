//node server.js (para el servidor)
//npm run dev (para desarrollo)
const confGlobal={
    zonaHorariaUTF: -5
};

//portatil oficina
/*const confDb={
    host: "localhost",
    user: "openpg",
    port: 5432,
    password: "openpgpwd",
    database: "mediciones_sitrad",
};*/
//servidor
const confDb={
    host: "localhost",
    user: "odoo17",
    port: 5432,
    password: "odoo17",
    database: "sitrad.jbp.com.ec"
};
module.exports = {
    confDb,
    confGlobal,
};