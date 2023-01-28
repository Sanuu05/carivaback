const express = require('express')
const { signUp, Login, myData } = require('../controller/user')
const route = express.Router()
const auth = require('../middleware/auth')

route.post('/signup',signUp)
route.post('/login',Login)
route.get('/getuser',auth,myData)


module.exports = route
