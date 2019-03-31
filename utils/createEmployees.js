const faker = require('faker');
const N_EMPL = 1000;

function createEmployees() {
    const genr = ['male','female'];
    const id = faker.random.number({min: 0, max: 1000000});
    const emailAddress = faker.internet.email();
    const companyName = faker.company.companyName(0);
    const gender = faker.random.arrayElement(genr);
    const name = faker.name.findName();
    const salary = faker.random.number({min: 12000, max: 30000});
    const title = faker.random.words();
    return {id,emailAddress,companyName,gender,name,salary,title}
}
module.exports = async function createEmpl() {

    const MODEL_PATH = './model';
    const Employee = require(MODEL_PATH + '/employee');
    const Company = require(MODEL_PATH + '/company');
    for (let i = 0; i < N_EMPL; i++) {
        const employee = new Employee(createEmployees());
        const {companyName, salary, _id} = employee;
        await employee.save();

        try {
            const comp = await Company.findOne({companyName});
            if (!comp) {
                const company = new Company({companyName,salary,quantity:1});
                company.employees.peoples.push({id: employee._id});
                await company.save();
            } else {
                await Company.updateMany({"companyName": companyName}, {
                    $inc: {"salaryBudget": salary, "quantity": 1},
                    $addToSet: {"employees.peoples": {id: _id}}
                });
            }


        } catch (e) {
            await Employee.findOneAndDelete({id});



        }
    }


};