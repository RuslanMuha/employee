const faker = require('faker');
const config = require('config');
const N_EMPL = config.get('N_EMPL_RANDOM');
const MODEL_PATH = '../model';
const Employee = require(MODEL_PATH + '/employee');
const Company = require(MODEL_PATH + '/company');

function createEmployees() {
    const genr = ['male','female'];
    const id = faker.random.number({min: 0, max: 1000000});
    const emailAddress = faker.internet.email();
    const companyName = faker.company.companyName(0);
    const gender = faker.random.arrayElement(genr);
    const name = faker.name.findName();
    const salary = faker.random.number({min: 12000, max: 30000});
    const title = faker.random.words();
    return {id,companyName,emailAddress,gender,name,salary,title}
}


module.exports = async function createEmpl() {


    for (let i = 0; i < N_EMPL; i++) {
        const employee = new Employee(createEmployees());
        const {companyName, salary, _id} = employee;
        await employee.save();

        try {
            await Company.updateMany({companyName}, {
                $set:{"companyName":companyName},
                $inc: {"salaryBudget": salary, "quantity": 1},
                $addToSet: {"employees.peoples": {id: _id}}
            },{upsert:true});
        } catch (e) {
            await Employee.findOneAndDelete({id});

        }
    }


};