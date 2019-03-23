const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const companySchema = new Schema({
        companyName: {
            type: String,
            index: true
        },
        salaryBudget: {
            type: Number,
        },
        quantity: {type: Number},
        employees: {
            peoples: [{
                id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Employee',
                    index: true,
                    unique: true,
                    required: true
                }
            }],

        }
    });

module.exports = mongoose.model('Company', companySchema);