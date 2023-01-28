const express = require('express')
const route = express.Router()
const upload = require('../multer')
const cloudinary = require('../cloud')
const fs = require('fs')
const Cars = require('../models/cars')
const auth = require('../middleware/auth')
const User = require('../models/user')
const Order = require('../models/orders')
const Razorpay = require("razorpay");
const crypto = require('crypto')
const axios = require('axios')
const { json } = require('body-parser')

//TODO : UPLOAD 

exports.upload = async (req, res) => {
    try {
console.log('update')

        const uploader = async (path) => await cloudinary.uploads(path, 'Images');
        const { name, brand, price, fueltype, transmission, seats, doors, bags, address, city } = req.body
        const find = await User.findById(req.user)

        if (req.method === "POST") {
            if (name && brand && price && fueltype && transmission && seats && doors && find && bags && address && city) {
                const urls = []
                const files = req.files;
                for (const file of files) {
                    const { path } = file;
                    const newPath = await uploader(path)
                    urls.push(newPath)
                    fs.unlinkSync(path)
                }

                const newdata = new Cars({ ...req.body, img: urls, by: find })
                const savedata = await newdata.save()
                res.json(savedata)

            }
            else {
                res.status(400).json('fill all fields')
                console.log('fill all fields')
            }

        }
        else {
            res.status(405).json({
                err: 'method is not suppoerted'
            })
            onsole.log('not')
        }
    } catch (error) {
        // console.log('err', error)

    }
}

// TODO : GET ALL CARS 

exports.getAllCars= async (req, res) => {
    try {
        const cars = await Cars.find({by:{$ne:req.user}})
        console.log("cars",cars,req.user)
        const orders = await Order.find()
        if (cars) {
            const carfil = cars?.map( (val, ind) => {
                const findorder =  orders.filter(p=>p.carid= val?._id  )

                // console.log("car",val)
                return {val,findorder}


            })
            
            res.json(carfil)

        }

    } catch (error) {
        console.log(error)

    }
}


// TODO : SEARCH
exports.Search= async (req, res) => {
    try {
        console.log(req.params.id)
        const token = '0e54449e-849f-4bb2-a6e7-29fdaed99b10'
        const axiosdata = await axios.post('https://outpost.mapmyindia.com/api/security/oauth/token?client_id=33OkryzDZsKTy-g6L2eOxugpgslTaKzkYllloIXrYZ8FO9h-cjOhpbeGWTsjcp93IEPd1_0Z5fWEluRj9B8IBQ==&client_secret=lrFxI-iSEg89pi28yTRIV2CD-BHm_5941BTQ9hGVQUkhCSO32CulRGT1A7MxzxamK4XdWljWPaHIWadX6QCsrr8dJYWxvuyy&grant_type=client_credentials')
        if (axiosdata?.data) {
            const config = {

                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
                    Authorization: `Bearer ${axiosdata?.data?.access_token}`,
                    'Content-Type': 'application/json',
                    // withCredentials: false,
                }
            };

            const { data } = await axios.get(`https://atlas.mapmyindia.com/api/places/geocode?address=${req.params.id}&itemCount=100`, config)
            res.json(data)
        }

    } catch (error) {
        // console.log('err', error)

    }
}

// TODO : MY CARS

exports.myCars= async (req, res) => {
    try {
        const cars = await Cars.find({ by: req.user })
        res.json(cars)
    } catch (error) {

    }
}


// TODO : DELETE CARS

exports.deleteCars = async (req, res) => {
    try {
        console.log('del')
        const cars = await Cars.findByIdAndDelete(req.params.id)
        res.json(cars)
    } catch (error) {

    }
}

// TODO : CARS DETAILS
exports.carDetail = async (req, res) => {
    try {
        const cars = await Cars.findById(req.params.id)

        const findorder = await Order.find({ carid: req.params.id })
        res.json({ data: cars, order: findorder })
    } catch (error) {

    }
}


// TODO : ORDERS

exports.Order= async (req, res) => {
    try {
        console.log("body",req.body.total)
        const instance = new Razorpay({
            key_id: "rzp_test_fvOAKuvkkgRaoU",
            key_secret: "dbY34WVDWmoEItESZTx3qWMV",
        });

        const options = {
            amount:Math.round(req.body.total *100), 
            currency: "INR",
            receipt: "receipt_order_74394",
        };
        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json(order);
        
    } catch (error) {
        res.status(500).send(error);
        // console.log('errr1',error)
    }
}


exports.Success= async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            totaldata,
            carid, from, to, hours, address
        } = req.body;

        const shasum = crypto.createHmac("sha256", "dbY34WVDWmoEItESZTx3qWMV");
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });
        
        const findcar = await Cars.findById(carid)
        const finduser = await User.findById(req.user)
        console.log('req', { findcar, finduser,from, to,hours,finduser })
        if (findcar && from && to && hours  && finduser) {
            const order = new Order({
                carid: findcar,
                from,
                to,
                hours,
                address,
                amount:totaldata?.total,
                by: finduser
            })
            const save = await order.save()
            console.log("savedata",save)
            res.json({
                msg: "success", 
                orderId: razorpayOrderId,
                paymentId: razorpayPaymentId,
            });
            // res.json(save)
        }
       
    } catch (error) {
        res.status(500).send(error);
        console.log('error')
    }
};

// TODO :GET ALL ORDERS
exports.allOrders= async (req, res) => {
    try {
        const orders = await Order.find()
        res.json(orders)
    } catch (error) {

    }
}


// TODO :MY BOOKING
exports.myBooking =async (req, res) => {
    console.log('cvcccc',req.user)
    try {
        const findorder = await Order.find({ by: req.user }).populate("carid", "name brand img price bags doors seats transmission")
        console.log("allo",findorder)
        res.json(findorder)
    } catch (error) {

    }
}

// TODO : CAR ORDERED 
exports.carOrder= async (req, res) => {
    try {

        const findorder = await Order.find().populate("carid", "name brand img price bags doors seats transmission by").populate("by", "name email")
        const filter = findorder?.filter(p => p?.carid?.by == req.user)
        // console.log("v",filter)
        res.json(filter)
    } catch (error) {

    }
}

