const express = require('express');
const medicoRoutes = require('./src/apis/medicoController')
const visitadorRoutes = require('./src/apis/visitadorController')
const app = express();

const port = 3000;

app.get('/', (req, res)=>{
    res.send('Hola from root');
});
//escucha las apis de medico
app.use('/medico',medicoRoutes);
app.use('/visitador',visitadorRoutes);
app.listen(port, ()=>{
    console.log(`app runing on port ${port}!!`);    
});

