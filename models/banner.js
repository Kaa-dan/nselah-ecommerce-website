const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    image:{
        type:Array,
        required:true,
    },
    is_active:{
        type:Number,
        default:1,
    }
})

module.exports = mongoose.model('Banner',bannerSchema)