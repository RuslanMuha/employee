
const express = require('express');
const EmployeeController = require('../controller/employeeController');
const router = express.Router();

router.post("/add", EmployeeController.addEmployee );

router.delete("/remove",EmployeeController.removeEmployeeFromCompany );

router.get("/",EmployeeController.getEmployee);

router.get('/all',EmployeeController.getEmployees);

router.get('/salary',EmployeeController.getSalary);
router.get('/company',EmployeeController.getCompany);


module.exports = router;

