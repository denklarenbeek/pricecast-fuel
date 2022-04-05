const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {
        type: String
    }
})

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;