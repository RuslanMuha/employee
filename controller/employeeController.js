const validate = require('../validation');
const Joi = require('joi');
const MODEL_PATH = '../model';
const Employee = require(MODEL_PATH + '/employee');
const Company = require(MODEL_PATH + '/company');


const schema = Joi.object().keys({
    id: Joi.number().required(),
    emailAddress: Joi.string().email().normalize().required(),
    companyName: Joi.string().required(),
    gender: Joi.string().required(),
    name: Joi.string().required(),
    salary: Joi.number().min(8000).max(40000).required(),
    title: Joi.string().required()


});


function throwError(message,httpCode,next) {
    const error = new Error(message);
    error.httpStatusCode = httpCode;
    return next(error);
}

exports.addEmployee = async (req, res,next) => {
    if(!validate(req, res, schema,next)){
        return;
    }
    const employee = new Employee(req.body);
    const {companyName, salary, _id, id} = employee;


    if(!req.user){
        return throwError('authentication error',401,next);
    }
    try {
        await employee.save();

    } catch (e) {
        return throwError('failed to save',500,next);

    }
    try {
        const comp = await Company.findOne({companyName});
        if (!comp) {
            const company = new Company({companyName, salaryBudget: salary, quantity: 1});
            company.employees.peoples.push({id: employee._id});
            await company.save();
        } else {
            await Company.updateMany({companyName}, {
                $inc: {"salaryBudget": salary, "quantity": 1},
                $addToSet: {"employees.peoples": {id: _id}}
            });
        }
        return res.send(true);


    } catch (e) {

        await removeEmployee(id);

        return throwError('failed to save',500,next);


    }


};

exports.removeEmployeeFromCompany = async (req, res,next) => {
    const {id} = req.query;
    if (!id) {
        res.statusCode(400).send(false);
    }
    if(!req.user){
        return throwError('authentication error',401,next);

    }
    try {
        await remove(id);
        res.send(true)
    } catch (e) {
        return throwError('failed to remove',500,next);
    }


};

async function remove(id) {

    const employee = await Employee.findOne({id});
    const {companyName, salary, _id} = employee;
    await Company.updateMany({companyName}, {
        $inc: {"salaryBudget": -salary, "quantity": -1},
        $pull: {"employees.peoples": {id: _id}}
    });

    const {quantity} = await Company.findOne({companyName});
    if (quantity === 0) {
        await Company.findOneAndDelete({companyName})
    }
    removeEmployee(id)

}

async function removeEmployee(id) {
    await Employee.findOneAndDelete({id});
}

exports.getEmployee = async (req, res,next) => {
    const {id} = req.query;
    if (!id) {
        return throwError('bad request',400,next);
    }
    try {
        const empl = await Employee.findOne({id});
        res.send(empl);
    } catch (e) {
        return throwError('server error',500,next);
    }

};

exports.getEmployees = async (req, res,next) => {
    const result = {};
    try {
        const empls = await Employee.find().select('-__v -_id');
        for (let empl of empls) {
            result[empl.id] = empl;
        }
    } catch (e) {
        return throwError('server error',500,next);
    }

    res.send(result);

};

exports.getCompany = async (req, res,next) => {
    const companyName = req.query.companyName;
    try {
        const empl = await Company.findOne({companyName})
            .populate('employees.peoples.id');


        res.send(empl);

    } catch (e) {
       return throwError('server error',500,next);
    }

};
exports.getSalary = async (req, res,next) => {
    const companyName = req.query.companyName;
    try {
        const comp = await Company.findOne({companyName});
        res.send(`${comp.salaryBudget}`);

    } catch (e) {
        return throwError('server error',500,next);
    }

};
