//const jwt=require('jsonwebtoken');
const jwt  = require('express-jwt');
const config=require('config');

function throwError(message, httpCode, next) {
    const error = new Error(message);
    error.httpStatusCode = httpCode;
    return next(error);
}

module.exports=(req,res,next)=>{
    const token=req.header('x-auth-token');
    if(!token){
        return throwError("user isn't authorized",401,next);
    }
    else {
        try {


            req.user = jwt({
                    secret: config.get('jwtSecret'),
                    userProperty: 'payload',
                    getToken: token
                });

                // optional: jwt({
                //     secret: config.get('jwtSecret'),
                //     userProperty: 'payload',
                //     getToken: token,
                //     credentialsRequired: false
                // })

                //jwt.verify(token, config.get('jwtSecret'));
            next();

        }catch(e){
            console.log(e);
            return throwError('invalid token',401,next);
        }


    }
};
