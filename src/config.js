//node server.js (para el servidor)
//npm run dev (para desarrollo)
const confGlobal={
    zonaHorariaUTF: -5
};
//mac
/*const confDb = {
    host: "localhost",
    user: "mac",
    port: 5432,
    password: "odoo",
    database: "vmf"
};*/
//portatil oficina
/*const confDb={
    host: "localhost",
    user: "openpg",
    port: 5432,
    password: "openpgpwd",
    database: "vmf",
};*/
//servidor
const confDb={
    host: "localhost",
    user: "odoo17",
    port: 5432,
    password: "odoo17",
    database: "vmf.jbp.com.ec"
};
module.exports = {
    confDb,
    confGlobal,
};