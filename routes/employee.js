
const express = require('express');
const EmployeeController = require('../controller/employeeController');
const router = express.Router();

router.post("/add", EmployeeController.addEmployee );

router.delete("/remove",EmployeeController.removeEmployee );

router.get("/",EmployeeController.getEmployee);

router.get('/all',EmployeeController.getEmployees);

router.get('/salary',EmployeeController.getSalary);


module.exports = router;

