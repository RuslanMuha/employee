
const validate = require('../validation');
const Joi= require('joi');
const MODEL_PATH = '../model';
const Employee= require(MODEL_PATH + '/employee');
const Company= require(MODEL_PATH + '/company');


const schema = Joi.object().keys({
    id:Joi.number().required(),
    emailAddress:Joi.string().email().regex(/^\S+@\S+$/).required(),
    companyName: Joi.string().required(),
    gender:Joi.string().required(),
    name:Joi.string().required(),
    salary:Joi.number().min(8000).max(40000).required(),
    title: Joi.string().required()



});

exports.addEmployee = async (req, res) => {
   // const {companyName,salary} = req.body;
    const employee = new Employee(req.body);
   // const company = new Company(companyName,salary);

  try{
      if (!validate(req, res, schema)){
          res.send(false);
          return;
      }
      await employee.save();
    //  await company.save();
      res.send(true);

  }catch (e) {
      res.send(false);
  }


};

exports.removeEmployee = async (req, res) => {
    const id = req.query.id;
    if(!id){
        res.statusCode(400).send(false);
    }
    try{
       await Employee.findOneAndDelete({id});
        res.send(true);
    }catch (e) {
        res.send(false);
    }

};

exports.getEmployee=  async (req, res) => {
    const id = req.query.id;
    if(!id){
        res.statusCode(400).send(false);
    }
    try{
       const empl = await Employee.findOne({id});
        res.send(empl);
    }catch (e) {
        res.send(false);
    }

};

exports.getEmployees =  async (req, res) => {
    const result = {};
    try{
        const empls = await Employee.find().select('-__v -_id');
        for(let empl of empls){
            result[empl.id] = empl;
        }
    }catch (e) {
        res.send(e)
    }

     res.send(result);

};

exports.getSalary = (req,res)=>{
    res.send(true);

};


