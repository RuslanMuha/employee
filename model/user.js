const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersMongoSchema = new Schema({
    email: {type: String, index: true, unique: true},
    password: String,
    roles: Array
});
module.exports = mongoose.model('User', usersMongoSchema);

