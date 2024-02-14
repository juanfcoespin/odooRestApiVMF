    const {Client} = require('pg');
    const dbClient = new Client({
        host: "localhost",
        user: "mac",
        port: 5432,
        password: "odoo",
        database: "vmf"
    });
    dbClient.connect();
    module.exports = dbClient;