const validate = require('../validation');
const Joi = require('joi');
const MODEL_PATH = '../model';
const Employee = require(MODEL_PATH + '/employee');
const Company = require(MODEL_PATH + '/company');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require(MODEL_PATH + '/user');


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
    const employee = new Employee(req.body);
    const {companyName, salary, _id, id} = employee;

    if (!validate(req, res, schema)) {
        res.send(false);
        return;
    }
    if(!req.user){
        res.status(401).send('authentication error');
        return;
    }
    try {
        await employee.save();

    } catch (e) {
        res.send(false);
        return;
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
        res.send(e);


    }


};

exports.removeEmployeeFromCompany = async (req, res) => {
    const id = req.query.id;
    if (!id) {
        res.statusCode(400).send(false);
    }
    try {
        await remove(id);
        res.send(true)
    } catch (e) {
        res.send(false)
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

exports.getEmployee = async (req, res) => {
    const {id} = req.query;
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
        res.send(`${comp.salaryBudget}`);

    } catch (e) {
        res.send(false)
    }

};

// exports.signup = async (req, res) => {
//     if (!validate(req, res, usersSchema)) {
//         return;
//     }
//     try {
//         let user = new User(req.body);
//         await hashUserPassword(user);
//         user = await user.save();
//         res.send(user)
//     } catch (e) {
//         res.send(false)
//     }
// };
//
// exports.login = async (req,res)=>{
//     const {email, password} = req.body;
//     if (!validate(req, res, usersSchema)) {
//         return;
//     }
//     try {
//        const user = await User.findOne({email});
//         if (!user || !await checkUser(user, password)) {
//             console.log("authorization error");
//             res.status(401).send("authorization error");
//             return;
//         }
//         res.send(getJwt(user));
//
//
//     } catch (e) {
//         res.status(401).send(false)
//     }
// };
//
//
// async function checkUser(user, password) {
//     return await bcrypt.compare(password,user.password);
// }
//
// function getJwt(user) {
//     const secret = config.get('jwtSecret');
//     if (!secret) {
//         console.error("jwt secret isn't defined");
//         process.exit(1);
//     }
//     return jwt.sign({_id:user._id},secret)
// }
// async function hashUserPassword(user) {
//     user.password = await bcrypt.hash(user.password, 12)
// }
//


