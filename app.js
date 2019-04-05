const express = require('express');
const mongoose = require('mongoose');
const cores = require('cors');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const config = require('config');
const path = require('path');
const fs = require('fs');
const employee = require('./routes/employee');
const auth = require('./routes/authentication');

const PORT = 8080;
const app = express();


// creating random workers
//const employeeCreation = require('./utils/createEmployees');



app.use(cores());
app.use(express.json());

const logStream = rfs("./logs/file.log", {
    size: "1M", // rotate every 1 MegaBytes written
    interval: "1d", // rotate daily
});

const skipCode = config.get('skip_code');
const format = config.get('morgan_format');
const stream = process.env.NODE_ENV === 'production' ? logStream : process.stdout;


fs.existsSync(path.resolve(__dirname,'logs')) || fs.mkdirSync(path.resolve(__dirname,'logs'));

// app.use(morgan(format, {
//     stream,
//     skip: (req, res) => res.statusCode < skipCode
// }));
app.use('/employee', employee);
app.use('/user', auth);

app.use((error, req,res, next)=>{
    res.status(error.httpStatusCode).json({
        status:'error',
        code:error.httpStatusCode,
        message:error.message,
        data:[]
    });

});

async function connect() {
    const username = config.get('db.username');
    const password = config.get('db.password');
    const hostname = config.get('db.hostname');
    const database = config.get('db.database');
    const mongoConnection = 'mongodb+srv://';
    if(!password){
        console.error('password is not defined');
        process.exit(1)
    }
    const uri = `${mongoConnection}${username}:${password}@${hostname}/${database}?retryWrites=true`;
    await mongoose.connect(uri,{useNewUrlParser: true});
    app.listen(PORT);
    console.log('Connection is mongoDB is established')

}

//
// employeeCreation().then(()=>{
//      process.exit(0)
// });
connect();

