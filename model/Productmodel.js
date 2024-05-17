const mongoose = require("mongoose");
const product_Schema = mongoose.Schema({
    title : {type : String,required : true},
    description : {type : String,required : true},
    price : {type : String,required : true},
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'category_DataColl',
        
      },
    image: {type : String,required : false},
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'userArba',
     
      }
});

const Product_Model = new mongoose.model("productData", product_Schema);
module.exports = { Product_Model };