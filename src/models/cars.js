const mongoose = require('mongoose')
const {ObjectId} =  mongoose.Types
const carsSchema = mongoose.Schema({
    name:{type:String,required:true},
    brand:{type:String,required:true},
    address:{type:String,required:true},
    city:{type:String,required:true},
    price:{type:Number,required:true},
    fueltype:{type:String,required:true},
    transmission:{type:String,required:true},
    seats:{type:Number,required:true},
    doors:{type:Number,required:true},
    bags:{type:Number,required:true},
    img:{type:Array,required:true},
    by:{
        type:ObjectId,
        ref:"User"

    }
})

const Cars = mongoose.model('Cars',carsSchema)
module.exports = Cars