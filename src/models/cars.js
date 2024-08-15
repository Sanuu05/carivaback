const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const carSchema = mongoose.Schema({
  modeName: { type: String, required: true },
  brand: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  seats: { type: Number, required: true },
  doors: { type: Number, required: true },
  bags: { type: Number, required: true },
  images: { type: Array, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  createdBy: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
});

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
