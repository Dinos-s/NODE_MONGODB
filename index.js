// initial config
const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
// leitura de JSON
app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use(express.json());

// rota inicial
app.get('/', (req, res) => {
    res.json({msg: 'Usando node!'})
    //console.log(req);
})

// rotas API
const personRoutes = require('./routes/personRoutes')
app.use('/person', personRoutes)

// conectar ao bd
mongoose.set("strictQuery", true)
const DB_USER = process.env.DB_USER
const DB_PASS = encodeURIComponent(process.env.DB_PASS)

// porta de saida
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.3dv7faz.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    console.log('Conectado ao Mongo');
    app.listen(3000)
}).catch((err) => {
    console.log(err);
})