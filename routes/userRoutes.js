const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// rota publica para ver o usuário pelo id
// router.get('/user/:id', async (req, res) => {
//     const id = req.params.id

//     const user = await User.findById(id, '-password')
//     if(!user){
//         return res.status(404).json({msg: 'User not found'})
//     }

//     res.status(200).json({user})
// })

// rota privada
router.get('/user/auth/:id', checkToken, async(req, res)=>{
    const id = req.params.id

    const user = await User.findById(id, '-password')
     
    if(!user){
        return res.status(404).json({msg: 'User not found'})
    }

    res.status(200).json({user})
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password')
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({error: error})
    }
})

//check token
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({msg: 'Acess denied'})
    }

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch (error) {
        res.status(400).json({msg: 'Token Invalid'})
    }
}

// cadastrando user
router.post('/auth/register', async (req, res) => {
    const {name, email, password, confirmpass} = req.body

    if (!name) {
        return res.status(422).json({msg: 'Invalid username'})
    }

    if (!email) {
        return res.status(422).json({msg: 'Invalid email'})
    }

    if (!password){
        return res.status(422).json({msg: 'Invalid password'})
    }

    if(password != confirmpass){
        return res.status(422).json({msg: 'Password mismatch'})
    }

    // usuário já existe?
    const userExists = await User.findOne({email: email})
    if (userExists) {
        return res.status(422).json({msg: 'User exists, please use other email'})
    }

    // embararalhando senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const user = new User({
        name: name,
        email: email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({msg: 'Usuario add com sucesso'})
    } catch (error) {
        res.status(500).json({error: error})
    }
})

// login user
router.post('/auth/login', async(req, res) => {
    const {email, password} = req.body

    if (!email) {
        return res.status(422).json({msg: 'Invalid email'})
    }

    if (!password){
        return res.status(422).json({msg: 'Invalid password'})
    }

    const user = await User.findOne({email: email})
    if (!user) {
        return res.status(404).json({msg: 'User not found'})
    }

    const passCheck = await bcrypt.compare(password, user.password)
    if (!passCheck) {
        return res.status(422).json({msg: 'Password incorrect'})
    }

    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
            name: user.name,
        }, secret)
        res.status(200).json({msg: 'Autenticação realizada com sucesso', token})
    } catch (error) {
        res.status(500).json({msg: error})
    }
    
})

// rota privada para excluir usuário
router.delete('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router