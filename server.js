const express = require('express');
const medicoRoutes = require('./src/medico/routes')
const app = express();
const port = 3000;


app.get('/', (req, res)=>{
    res.send('Hola from root');
});
app.use('/medico',medicoRoutes);
app.listen(port, ()=>{
    console.log(`app runing on port ${port}!!`);    
});

