const Joi= require('joi');

function getMessage(error) {
    return error.map(er=>er.message).join(';');
}

function validation(req,res,schema) {
    const obj = res.body;
    const result = Joi.validate(obj,schema);
    if(result.error){
        res.sendStatus(400).send(getMessage(result.error.details));
        return false;
    }
    return true;

}
module.exports = validation;