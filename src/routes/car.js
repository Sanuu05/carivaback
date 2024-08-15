const express = require('express')
const { getAllCars, Search, myCars, deleteCars, carDetail, Order, allOrders, myBooking, carOrder, Success, upload } = require('../controller/car')
const route = express.Router()
const authMiddleware = require("../middleware/auth");
const uploads = require('../multer')

route.use('/upload',authMiddleware,uploads.array('image'),upload)
route.get('/cars',authMiddleware,getAllCars)
route.get('/search/:id',Search)
route.get('/mycars',authMiddleware,myCars)
route.delete('/car/:id',authMiddleware,deleteCars)
route.get('/detail/:id',carDetail)
route.post('/order',Order)
route.get('/allorders',allOrders)
route.get('/mybooking',authMiddleware,myBooking)
route.get('/carorder',authMiddleware,carOrder)
route.post('/success',authMiddleware,Success)


module.exports = route