const express = require('express');
const bodyParser = require('body-parser');
const medicoRoutes = require('./src/apis/medicoController');
const distribuidorRoutes = require('./src/apis/distribuidorController');
const farmaciaRoutes = require('./src/apis/farmaciaController');
const visitadorRoutes = require('./src/apis/visitadorController');
const pedidoRoutes = require('./src/apis/pedidoController');
const articuloRoutes = require('./src/apis/articuloController');
const cicloRoutes = require('./src/apis/cicloController');
const cuboRoutes = require('./src/apis/cuboController');
const app = express();
var cors = require('cors')

//const port = 3000;
const port = 3030; //para pruebas

//para iniciar el servicio: node server.js
app.use(bodyParser.json({limit: '50mb'}));//Set Request Size Limit
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
app.use('/distribuidor',distribuidorRoutes);
app.use('/farmacia',farmaciaRoutes);
app.use('/visitador',visitadorRoutes);
app.use('/pedido',pedidoRoutes);
app.use('/articulo',articuloRoutes);
app.use('/ciclo',cicloRoutes);
app.use('/cubo',cuboRoutes);
app.listen(port, ()=>{
    console.log(`nginx bus de servicios vmf on port ${port}!!`);    
});

