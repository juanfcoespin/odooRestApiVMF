const express = require('express');
const bodyParser = require('body-parser');
const medicoRoutes = require('./src/apis/medicoController')
const visitadorRoutes = require('./src/apis/visitadorController')
const app = express();

const port = 3000;

//para iniciar el servicio: node server.js

app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.send('Hola from root');
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

