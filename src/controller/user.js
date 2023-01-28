const express = require("express")
const app = express()
const route = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const Group = require('../models/group')
const auth = require('../middleware/auth')


// signup 

// TODO : SIGNUP
exports.signUp= async (req, res) => {
    try {
        const { name, email} = req.body
        const userRes = new User({
            name,
            email

        })
        const userSave = await userRes.save()
        res.json(userSave)
    } catch (error) {
        console.log("err1",error)
    }
}

//TODO: Login 

exports.Login = async (req, res) => {
    try {
        const { email} = req.body
        const exuser = await User.findOne({ email })
        const token = await jwt.sign({ id: exuser._id },process.env.SEC_KEY)
        res.json({
            token,
            user: exuser
        })
    } catch (error) {
        console.log("err2",error)
    }

}

// TODO : GET MY DAta

exports.myData =async(req,res)=>{
    try {
        const user = await User.findById(req.user)
        res.json(user)
    } catch (error) {
        
    }
}

