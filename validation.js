const Joi= require('joi');

function throwError(message,httpCode,next) {
    const error = new Error(message);
    error.httpStatusCode = httpCode;
    return next(error);
}
function getMessage(error) {
    return error.map(er=>er.message).join(';');
}

function validation(req,res,schema,next) {
    const obj = res.body;
    const result = Joi.validate(obj,schema);
    console.log(`result: ${result.error}`);
    if(result.error){
        return throwError(getMessage(result.error.details),400,next);
    }
    return true;

}
module.exports = validation;