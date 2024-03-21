const express = require('express');
const bodyParser = require('body-parser');
const valoresRoutes = require('./src/apis/valoresController');
const app = express();
var cors = require('cors')

const port = 3001;

//para iniciar el servicio: node server.js

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
    res.send(`nginx bus de servicios sitrad on port ${port}!!`);
});

//escucha las apis de valores
app.use('/valores',valoresRoutes);

app.listen(port, ()=>{
    console.log(`nginx bus de servicios sitrad hibrido on port ${port}!!`);    
});

