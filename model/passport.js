const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local');
const Users = require('./user');


passport.use(
    new LocalStrategy(
        {usernameField: 'email',
         passwordField: 'password'},
        async (email, password, done) => {
            try {
            const user = await Users.findOne({email});
            console.log(user);
            console.log(password);
            if(!user || await  !bcrypt.compare(password,user.password)){
                return done(null,false,{
                    errors:{
                        'email or password':'is invalid'
                    }
                });
            }
            return done(null,user);


            }catch (e) {
                return done;
            }
        }));

