const mongoose = require("mongoose");
const product_Schema = mongoose.Schema({
    title : {type : String,required : true},
    description : {type : String,required : true},
    price : {type : String,required : true},
    category: {type : String,required : false},
    image: {type : String,required : true},
    owner: {type : String,required : false},
});

const Product_Model = new mongoose.model("productData", product_Schema);
module.exports = { Product_Model };