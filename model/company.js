const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const companySchema = new Schema({
        companyName: {
            type:String,
            required:true
        },
        salary: {
            type: Number,
            required: true
        },
    },
    {autoIndex: false});


module.exports = mongoose.model('Company', companySchema);