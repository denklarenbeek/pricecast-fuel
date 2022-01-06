const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    token: {
        type: String
    },
    expire_date: {
        type: Number
    }
})

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;