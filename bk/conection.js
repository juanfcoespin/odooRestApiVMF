    const {Client} = require('pg');
    //mac
    /*const dbClient = new Client({
        host: "localhost",
        user: "mac",
        port: 5432,
        password: "odoo",
        database: "vmf"
    });*/
    //portatil oficina
    const dbClient = new Client({
        host: "localhost",
        user: "openpg",
        port: 5432,
        password: "openpgpwd",
        database: "vmf"
    });
    dbClient.connect();
    module.exports = dbClient;