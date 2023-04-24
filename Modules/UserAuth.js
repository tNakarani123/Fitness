const mongoose = require("mongoose");
const { Schema } = mongoose;

const User = new Schema({
    Name: {
        type: String,
        default: 'name'
    },
    Email_id: {
        type: String,
        require: true,
        unique: true,
    },
    Mobile_no: {
        type: String,
        require: true,
        unique: true,
    },
    Age: {
        type: Number,
        require: true
    },
    Weight: {
        type: Number,
        require: true
    },
    Height: {
        type: Number,
        require: true
    },
    Gender: {
        type: String,
        require: true
    },
    Level: {
        type: String,
        require: true
    },
    Gym_Time: {
        type: String,
        default: '00:00-00:00'
    },
    Password: {
        type: String,
        require: true
    },
    Date:{
        type: Date,
        default: Date.now
    }
});

const User_db = mongoose.model('User', User);
module.exports = User_db;