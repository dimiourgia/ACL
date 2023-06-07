const express = require('express')
const mongoose = require('mongoose')
const userModel = require('./models/Users')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors())

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@acl-db.ehlexfa.mongodb.net/db-ACL?retryWrites=true&w=majority`).then(console.log('connection established'))

async function createUser(profile){
    const encryptedPassword = await bcrypt.hash(profile.password, 10)
    const user = new userModel({
                firstName:profile.firstName,
                lastName:profile.lastName, 
                country:profile.country, 
                email:profile.email, 
                password:encryptedPassword,
            })
    await user.save()
    console.log(user);
}


app.post('/register',  async (req,res)=>{
    console.log('creating user')
    const userData = req.body
    console.log(userData)
    const user = await userModel.findOne({email: userData.email})

    if(user){
        res.json({message:'User already registered', type:'error'})
        return
    }

    createUser(userData).then(res.json({message:'user registered sucessfully', type:'success'}))
})

app.post('/login', async (req, res)=>{
    console.log('trying to login')
    const {email, password} = req.body

    const user = await userModel.findOne({email})
    if(!user){
        res.json({message:'This email is not associated with any account', type:'error'})
        return
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if(!validPassword){
        res.json({message:'Email or Password Incorrect', type:'error'})
        return
    }

    const token = jwt.sign({id: user._id}, process.env.SECRET)
    res.json({token, userId: user._id})
})



if(porcess.env.PORT)
app.listen(process.env.PORT, ()=>{
    console.log('listening on port ', process.env.PORT)
})

module.exports = app