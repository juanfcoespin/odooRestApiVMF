const express = require('express');
const client = require('./conection.js');
const app = express();
const port = 3000;



app.listen(port, ()=>{
    console.log('app runing!!');    
});

app.get('/medicos', (req, resp)=>{
    //resp.send('hola');
    var sql='select id, name from tt_visitas_medico';
    client.query(sql,(err, result)=>{
        if(!err){
            resp.send(result.rows);
        }
    });
    client.end;
});
client.connect();