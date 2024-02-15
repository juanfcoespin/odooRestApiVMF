const express = require('express');
const bodyParser = require('body-parser');
const medicoRoutes = require('./src/apis/medicoController')
const visitadorRoutes = require('./src/apis/visitadorController')
const app = express();
var cors = require('cors')

const port = 3000;

//para iniciar el servicio: node server.js

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
    res.send(`nginx bus de servicios vmf on port ${port}!!`);
});
app.post('/tmp', (req, res)=>{
    const data = req.body;
    res.send(data);
});
//escucha las apis de medico
app.use('/medico',medicoRoutes);
app.use('/visitador',visitadorRoutes);
app.listen(port, ()=>{
    console.log(`nginx bus de servicios vmf on port ${port}!!`);    
});

