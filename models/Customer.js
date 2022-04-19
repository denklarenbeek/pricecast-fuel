const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    cid: {
        type: String
    },
    name: {
        type: String
    },
    picture: {
        type: String,
        default: '/img/image.jpg'
    }
})

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;