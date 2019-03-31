
const express = require('express');
const EmployeeController = require('../controller/employeeController');
const router = express.Router();
const auth=require('../authentication');

router.post("/add",auth, EmployeeController.addEmployee );

router.delete("/remove",auth,EmployeeController.removeEmployeeFromCompany );

router.get("/",EmployeeController.getEmployee);

router.get('/all',EmployeeController.getEmployees);

router.get('/salary',EmployeeController.getSalary);
router.get('/company',EmployeeController.getCompany);



module.exports = router;

