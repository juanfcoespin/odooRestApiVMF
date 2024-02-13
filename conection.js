    const {Client} = require('pg');
    const client = new Client({
        host: "localhost",
        user: "mac",
        port: 5432,
        password: "odoo",
        database: "vmf"
    });
    module.exports = client;