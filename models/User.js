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
    },
    administrator: {
        type: Boolean,
        default: false
    },
    last_logged_in: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    }
})

UserSchema.index({
    name: 'text',
    email: 'text'
});

const User = mongoose.model('User', UserSchema);
module.exports = User;