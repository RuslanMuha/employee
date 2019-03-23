const validate = require('../validation');
const Joi = require('joi');
const MODEL_PATH = '../model';
const Employee = require(MODEL_PATH + '/employee');
const Company = require(MODEL_PATH + '/company');


const schema = Joi.object().keys({
    id: Joi.number().required(),
    emailAddress: Joi.string().email().regex(/^\S+@\S+$/).required(),
    companyName: Joi.string().required(),
    gender: Joi.string().required(),
    name: Joi.string().required(),
    salary: Joi.number().min(8000).max(40000).required(),
    title: Joi.string().required()


});

exports.addEmployee = async (req, res) => {
    const companyName = req.body.companyName;
    const employee = new Employee(req.body);
    const company = new Company();

    try {
        if (!validate(req, res, schema)) {
            res.send(false);
            return;
        }

        const comp = await Company.findOne({companyName});
        if (!comp) {
            company.companyName = companyName;
            company.salaryBudget = employee.salary;
            company.quantity = 1;
            company.employees.peoples.push({id: employee._id});
            company.save();
        } else {
            comp.salaryBudget = comp.salaryBudget + employee.salary;
            comp.quantity = comp.quantity + 1;
            comp.employees.peoples.push({id: employee._id});
            comp.save();
        }

        await employee.save();
        return res.send(true)

    } catch (e) {
        console.log(e);
        res.send(false);
    }


};

exports.removeEmployee = async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.statusCode(400).send(false);
    }
try{
    const empl = await Employee.findOne({id});
    const companyName = empl.companyName;
    await Company.findOne({companyName}).then(async com => {
        com.salaryBudget = com.salaryBudget - empl.salary;
        com.quantity = com.quantity -1;
        com.employees.peoples = com.employees.peoples.filter(res => {
            return res.id.toString() !== empl._id.toString();
        });
        await com.save();
        await Employee.findOneAndDelete({id});
        res.send(true);
    });
}catch (e) {
    res.send(false);
}






};

exports.getEmployee = async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.statusCode(400).send(false);
    }
    try {
        const empl = await Employee.findOne({id});
        res.send(empl);
    } catch (e) {
        res.send(false);
    }

};

exports.getEmployees = async (req, res) => {
    const result = {};
    try {
        const empls = await Employee.find().select('-__v -_id');
        for (let empl of empls) {
            result[empl.id] = empl;
        }
    } catch (e) {
        res.send(e)
    }

    res.send(result);

};

exports.getCompany = async (req, res) => {
    const companyName = req.query.companyName;
    try {
        const empl = await Company.findOne({companyName})
            .populate('employees.peoples.id');

        res.send(empl);

    } catch (e) {
        res.send(e)
    }

};
exports.getSalary = async (req, res) => {
    const companyName = req.query.companyName;
    try {
        const comp = await Company.findOne({companyName});
        console.log();
        res.send(`${comp.salaryBudget}`);

    }catch (e) {
       res.send(false)
    }

};


