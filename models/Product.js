const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    productId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    plu: {
        type: Number,
        required: true
    },
    benchmark: {
        type: Number,
        required: true
    },
    stationId: {
        type: Number,
        required: true
    },
    stationName: {
        type: String
    }, 
})

ProductSchema.index({productId: 1});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;