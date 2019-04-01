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
    const obj = req.body;
    const result = Joi.validate(obj,schema);
    if(result.error){
        return throwError(getMessage(result.error.details),422,next);
    }
    return true;

}
module.exports = validation;