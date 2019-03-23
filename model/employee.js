
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    id: {
        type: Number,
        index: true,
        unique: true,
        required: true
    },
    emailAddress: {
        type: String,
        required: true
    }
    ,
    companyName: {
        type:String,
        required:true
    }
    ,
    gender: {type:String,
    required: true
    }
    ,
    name: {
        type:String,
        required:true
    },

    salary: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    }
    // ,
    //     companyId: {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Company',
    //         required: true
    //     }
});


module.exports = mongoose.model('Employee', employeeSchema);
