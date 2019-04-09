const Joi = require('joi');
const MODEL_PATH = '../model';
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require(MODEL_PATH + '/user');
const validate = require('../validation');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(sendGridTransport({
   auth:{
       api_key: config.get("api_key")
   }

}));

function throwError(message,httpCode,next) {
    const error = new Error(message);
    error.httpStatusCode = httpCode;
    return next(error);
}


const usersSchema = Joi.object().keys({
    email: Joi.string().email(),
    password: Joi.string().min(8).trim().required().strict(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).trim().strict().error(() => {
       return {message:"password do not match"}
    }),
    //role: Joi.array().items(Joi.string().valid(['ADMIN', 'USER']))
});

function responseJSON(res,data,message) {
    res.status(200).json({
        status:'success',
        code:200,
        message:message,
        data:data
    });

}

exports.signup = async (req, res,next) => {
  if(!validate(req, res, usersSchema,next)){
      return;
  }
    delete req.body.confirmPassword;
    const {email} = req.body;
    req.body.email = email.toLowerCase();
    try {

        let user = new User(req.body);
        await hashUserPassword(user);
        user = await user.save();

        //use sendGrid for sending email
        // transporter.sendMail({
        //     to: email,
        //     from:'employeeCompany@node.com',
        //     subject:'Sign up successful',
        //     html:'<h1>You successfully signed up! </h1>'
        // });
        responseJSON(res,user,'successfully signed up');


    } catch (e) {
        console.log(e);
        return throwError('failed signed up',500,next);
    }
};

exports.login = async (req,res,next)=>{

    if (!validate(req, res, usersSchema,next)) {
        return ;
    }
    try {
        return passport.authenticate('local', {session: false}, (err, passportUser) => {
            if(err) {
                return next();
            }
            if(!passportUser) {
                return res.status(400).json({error: 'error on login'});
            }
            responseJSON(res,getJwt(passportUser),'successfully log in');

        })(req, res, next);
    } catch (e) {
        console.log(e);
        return throwError("failed log in",500,next);
    }
};

function getJwt(user) {
    const secret = config.get('jwtSecret');
    if (!secret) {
        console.error("jwt secret isn't defined");
        process.exit(1);
    }
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: user.email,
        id: user._id,
        exp: parseInt(expirationDate.getTime()/1000, 10)
    }, secret);
}
async function hashUserPassword(user) {
    user.password = await bcrypt.hash(user.password, 12)
}

