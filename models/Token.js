const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    expire_date: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    }
})

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;