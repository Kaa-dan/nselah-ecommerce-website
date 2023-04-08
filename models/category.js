const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        default:0
    },
    isAvailable:{
        type:Number,
        default:1
    }
})

module.exports = mongoose.model('Category',categorySchema)