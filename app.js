require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

// leitura de json
app.use(express.json())
//rota teste
app.get('/', (req, res) => {
    res.status(200).json({msg: 'teste de API + JWT'})
})

// rotas do usuario
const usersRoutes = require('./routes/userRoutes')
app.use('/user', usersRoutes)

// conectar ao bd
mongoose.set("strictQuery", true)
const user = process.env.DB_USER
const pass = process.env.DB_PASS

// porta de saida
mongoose.connect(`mongodb+srv://${user}:${pass}@cluster0.3dv7faz.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    console.log('Conectado ao Mongo');
    app.listen(3000)
}).catch((err) => {
    console.log(err);
})
