const jwt=require('jsonwebtoken');
const config=require('config');

module.exports=(req,res,next)=>{
    const token=req.header('x-auth-token');
    if(!token){
        res.status(401).send("user isn't authorized");
    }
    else {
        try {
            req.user=jwt.verify(token, config.get('jwtSecret'));
            next();

        }catch(e){
            res.status(401).send('invalid token') ;
        }


    }
};
