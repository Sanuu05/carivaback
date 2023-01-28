const mongoose = require('mongoose')
const {ObjectId} =  mongoose.Types
const orderSchema = mongoose.Schema({
    carid:{
        type:ObjectId,
        ref:"Cars"

    },
    from:{type:String,required:true},
    to:{type:String,required:true},
    address:{type:String,required:true},
    hours:{type:Number,required:true},
    amount:{type:Number,required:true},
    by:{
        type:ObjectId,
        ref:"User"

    }
})

const Order = mongoose.model('Order',orderSchema)
module.exports = Order