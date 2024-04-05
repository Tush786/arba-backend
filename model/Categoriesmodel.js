const mongoose = require("mongoose");
const Category_Schema = mongoose.Schema({
    name : {type : String,required : true},
    slug : {type : String,required : true},
    image: {type : String,required : false},
    owner: { type: mongoose.Schema.ObjectId, ref: 'userArba', required: false }

});

const Category_Model = new mongoose.model("category_DataColl", Category_Schema);
module.exports = { Category_Model };