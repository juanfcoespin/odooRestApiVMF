//node server.js (para el servidor)
//npm run dev (para desarrollo)
const confGlobal={
    zonaHorariaUTF: -5
};

//mac (mac, odoo)
const confDb = {
    host: "localhost",
    user: "odoo",
    port: 5432,
    password: "odoo",
    database: "vmf",
    odoo:{
        url: "http://localhost:1769",
        idUser:2,
        user: "admin",
        pwd: "AtLsV971*"
    } 
};

//portatil oficina
/*const confDb={
    host: "localhost",
    user: "openpg",
    port: 5432,
    password: "openpgpwd",
    database: "vmf",
    odoo:{
        url: "http://localhost:1769",
        idUser:2,
        user: "admin",
        pwd: "AtLsV971*"
    } 
};*/

//servidor produccion
/*const confDb={
    host: "localhost",
    user: "odoo17",
    port: 5432,
    password: "odoo17",
    database: "vmf.jbp.com.ec",
    odoo:{
        url: "http://localhost:1769",
        idUser:2,
        user: "admin",
        pwd: "AtLsV971*"
    } 
};*/
module.exports = {
    confDb,
    confGlobal,
};