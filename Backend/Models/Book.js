const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const BookSchema = new Schema({
    isbn:{type:'string' , required:true,unique:true},
    name:{type:'string' , required:true},
    author:{type:'string', required:true},
    availableQunatity:{type:'number', required:true},
    totalQuantity:{type:'number', required:true},
    borrowedBy: [{ type: Schema.Types.ObjectId, ref: "users" }],
    priceHistory: { type: Array, required: true, default: [] },
    quantityHistory: { type: Array, required: true, default: [] },
})


const BookModel = new model("book", BookSchema);
module.exports= BookModel;