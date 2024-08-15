const express = require("express");
const route = express.Router();
const upload = require("../multer");
const cloudinary = require("../cloud");
const fs = require("fs");
const Cars = require("../models/cars");
const auth = require("../middleware/auth");
const User = require("../models/user");
const Order = require("../models/orders");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const axios = require("axios");
const { json } = require("body-parser");

//TODO : UPLOAD

exports.upload = async (req, res) => {
  try {
    const uploader = async (path) => await cloudinary.uploads(path, "Images");

    const {
      modeName,
      brand,
      pricePerHour,
      fuelType,
      transmission,
      seats,
      doors,
      bags,
      address,
      lat,
      lng,
    } = req.body;

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not supported" });
    }

    if (
      !modeName ||
      !brand ||
      !pricePerHour ||
      !fuelType ||
      !transmission ||
      !seats ||
      !doors ||
      !user ||
      !bags ||
      !address || 
      !lat ||
      !lng
    ) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const user = await User.findOne({ uid: req.uid });
    const newCar = new Cars({ ...req.body, images: urls, createdBy: user });
    const savedCar = await newCar.save();

    return res.json(savedCar);
  } catch (error) {
    console.error("Error during upload:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// TODO : GET ALL CARS

exports.getAllCars = async (req, res) => {
  try {
    const cars = await Cars.find({ by: { $ne: req.user } });
    console.log("cars", cars, req.user);
    const orders = await Order.find();
    if (cars) {
      const carfil = cars?.map((val, ind) => {
        const findorder = orders.filter((p) => (p.carid = val?._id));

        // console.log("car",val)
        return { val, findorder };
      });

      res.json(carfil);
    }
  } catch (error) {
    console.log(error);
  }
};

// TODO : SEARCH
exports.Search = async (req, res) => {
  try {
    // const client_id = process.env.YOUR_CLIENT_ID;
    // const client_secret = process.env.YOUR_CLIENT_SECRET;

    // Get OAuth token

    // const tokenResponse = await axios.post(
    // `https://outpost.mapmyindia.com/api/security/oauth/token?client_id=${client_secret}==&client_secret=${client_id}&grant_type=client_credentials`
    // );

    // const accessToken = tokenResponse.data.access_token;

    // Set headers for subsequent API calls
    // const config = {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     "Content-Type": "application/json",
    //     "Access-Control-Allow-Origin": "*",
    //     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    //   },
    // };

    // Perform geocode search
    const { data } = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${req.params.id}`
    );

    // Extract relevant data from the API response
    // const locations = geocodeResponse.data.suggestedLocations.map(
    //   (location) => ({
    //     name: location.placeName,
    //     address: location.placeAddress,
    //     latitude: location.latitude,
    //     longitude: location.longitude,
    //   })
    // );

    res.json(data); // Send extracted locations as JSON response
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// TODO : MY CARS

exports.myCars = async (req, res) => {
  try {
    const cars = await Cars.find({ by: req.user });
    res.json(cars);
  } catch (error) {}
};

// TODO : DELETE CARS

exports.deleteCars = async (req, res) => {
  try {
    console.log("del");
    const cars = await Cars.findByIdAndDelete(req.params.id);
    res.json(cars);
  } catch (error) {}
};

// TODO : CARS DETAILS
exports.carDetail = async (req, res) => {
  try {
    const cars = await Cars.findById(req.params.id);

    const findorder = await Order.find({ carid: req.params.id });
    res.json({ data: cars, order: findorder });
  } catch (error) {}
};

// TODO : ORDERS

exports.Order = async (req, res) => {
  try {
    console.log("body", req.body.total);
    const instance = new Razorpay({
      key_id: "rzp_test_fvOAKuvkkgRaoU",
      key_secret: "dbY34WVDWmoEItESZTx3qWMV",
    });

    const options = {
      amount: Math.round(req.body.total * 100),
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
};

exports.Success = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      totaldata,
      carid,
      from,
      to,
      hours,
      address,
    } = req.body;

    const shasum = crypto.createHmac("sha256", "dbY34WVDWmoEItESZTx3qWMV");
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");

    // // comaparing our digest with the actual signature
    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    const findcar = await Cars.findById(carid);
    const finduser = await User.findById(req.user);
    console.log("req", { findcar, finduser, from, to, hours, finduser });
    if (findcar && from && to && hours && finduser) {
      const order = new Order({
        carid: findcar,
        from,
        to,
        hours,
        address,
        amount: totaldata?.total,
        by: finduser,
      });
      const save = await order.save();
      console.log("savedata", save);
      res.json({
        msg: "success",
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
      });
      // res.json(save)
    }
  } catch (error) {
    res.status(500).send(error);
    console.log("error");
  }
};

// TODO :GET ALL ORDERS
exports.allOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {}
};

// TODO :MY BOOKING
exports.myBooking = async (req, res) => {
  console.log("cvcccc", req.user);
  try {
    const findorder = await Order.find({ by: req.user }).populate(
      "carid",
      "name brand img price bags doors seats transmission"
    );
    console.log("allo", findorder);
    res.json(findorder);
  } catch (error) {}
};

// TODO : CAR ORDERED
exports.carOrder = async (req, res) => {
  try {
    const findorder = await Order.find()
      .populate(
        "carid",
        "name brand img price bags doors seats transmission by"
      )
      .populate("by", "name email");
    const filter = findorder?.filter((p) => p?.carid?.by == req.user);
    // console.log("v",filter)
    res.json(filter);
  } catch (error) {}
};
