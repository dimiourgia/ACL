const express = require('express')
const mongoose = require('mongoose')
const userModel = require('./models/Users')
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const app = express()
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors())

mongoose.connect("mongodb+srv://ajayaxes318:ajayaxes318@acl-db.ehlexfa.mongodb.net/db-ACL?retryWrites=true&w=majority").then(console.log('connection established'))

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

async function loginUser(credentials){
    const user = await userModel.findOne({email: credentials.email})

}


app.post('/register',  async (req,res)=>{
    console.log('creating user')
    const userData = req.body
    console.log(userData)
    const user = await userModel.findOne({email: userData.email})

    if(user){
        res.json('User already registered')
        return
    }

    createUser(userData).then(res.json('user registered sucessfully'))
})

app.post('/login', async (req, res)=>{
    console.log('trying to login')
    const {email, password} = req.body

    const user = await userModel.findOne({email})
    if(!user){
        res.json({message:'This email is not associated with any account'})
        return
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if(!validPassword){
        res.json({message:'Email or Password Incorrect'})
        return
    }

    const token = jwt.sign({id: user._id}, '20245')
    res.json({token, userId: user._id})
})



app.listen('8084', ()=>{
    console.log('listening on port 8084')
})