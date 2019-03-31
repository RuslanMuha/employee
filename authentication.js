const jwt=require('jsonwebtoken');
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
            req.user=jwt.verify(token, config.get('jwtSecret'));
            next();

        }catch(e){
            return throwError('invalid token',401,next);
        }


    }
};
