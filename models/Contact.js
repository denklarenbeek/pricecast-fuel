const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: "This must be a unique field"
    },
    phone: {
        type: String
    },
    company: {
        type: String
    },
    street: {
        type: String
    },
    postal: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    description: {
        type: String
    },
    crm_id: {
        type: String
    },
    language: {
        type: String,
        default: 'English'
    }, 
    sales_rep: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Contact = mongoose.model('Contact', ContactSchema);
module.exports = Contact;