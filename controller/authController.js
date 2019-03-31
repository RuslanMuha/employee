const Joi = require('joi');
const MODEL_PATH = '../model';
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require(MODEL_PATH + '/user');
const validate = require('../validation');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendGridTransport({
   auth:{
       api_key:'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'
   }
   
}));


const usersSchema = Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().min(8).regex(/[^\s]+/).required(),
    confirmPassword: Joi.string().min(8).regex(/[^\s]+/).required(),
    role: Joi.array().items(Joi.string().valid(['ADMIN', 'USER']))
});

exports.signup = async (req, res) => {
    if (!validate(req, res, usersSchema)) {
        return;
    }
    const {email,password,confirmPassword} = req.body;
    if(password.toString() !== confirmPassword.toString()){
        res.status(400).send('password does not match');
        return;
    }
    delete req.body.confirmPassword;
    try {

        let user = new User(req.body);
        await hashUserPassword(user);
        user = await user.save();
        transporter.sendMail({
            to: email,
            from:'employeeCompany@node.com',
            subject:'Sign up successful',
            html:'<h1>You successfully signed up! </h1>'
        });
        res.send(user)
    } catch (e) {
        res.send(false)
    }
};

exports.login = async (req,res)=>{
    const {email, password} = req.body;
    if (!validate(req, res, usersSchema)) {
        return;
    }
    try {
        const user = await User.findOne({email});
        if (!user || !await checkUser(user, password)) {
            console.log("authorization error");
            res.status(401).send("authorization error");
            return;
        }
        res.send(getJwt(user));


    } catch (e) {
        res.status(401).send(false)
    }
};


async function checkUser(user, password) {
    return await bcrypt.compare(password,user.password);
}

function getJwt(user) {
    const secret = config.get('jwtSecret');
    if (!secret) {
        console.error("jwt secret isn't defined");
        process.exit(1);
    }
    return jwt.sign({_id:user._id},secret)
}
async function hashUserPassword(user) {
    user.password = await bcrypt.hash(user.password, 12)
}

