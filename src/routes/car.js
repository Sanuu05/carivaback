const express = require('express')
const { getAllCars, Search, myCars, deleteCars, carDetail, Order, allOrders, myBooking, carOrder, Success, upload } = require('../controller/routes')
const route = express.Router()
const auth = require('../middleware/auth')
const uploads = require('../multer')

route.use('/upload',auth,uploads.array('image'),upload)
route.get('/cars',auth,getAllCars)
route.get('/search/:id',Search)
route.get('/mycars',auth,myCars)
route.delete('/car/:id',auth,deleteCars)
route.get('/detail/:id',carDetail)
route.post('/order',Order)
route.get('/allorders',allOrders)
route.get('/mybooking',auth,myBooking)
route.get('/carorder',auth,carOrder)
route.post('/success',auth,Success)


module.exports = route