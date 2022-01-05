const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String
    },
    temp_secret: {
        type: Object
    },
    secret: {
        type: Object
    }
})

const User = mongoose.model('User', UserSchema);
module.exports = User;