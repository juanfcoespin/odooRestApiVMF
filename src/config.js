    
    //mac
    /*const confDb = {
        host: "localhost",
        user: "mac",
        port: 5432,
        password: "odoo",
        database: "vmf"
    };*/

    //node server.js (para el servidor)
    //npm run dev (para desarrollo)

    //portatil oficina
    const confDb={
        host: "localhost",
        user: "openpg",
        port: 5432,
        password: "openpgpwd",
        database: "vmf",
    };
    const confGlobal={
        zonaHorariaUTF: -5
    };

    //servidor
    /*const confDb={
        host: "localhost",
        user: "odoo17",
        port: 5432,
        password: "odoo17",
        database: "vmf.jbp.com.ec"
    };*/
    module.exports = {
        confDb,
        confGlobal,
    };