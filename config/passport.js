//configuring the strategies for passport


// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var pg           = require('pg');

var passwordHash = require('password-hash');
var dbconfig = require('./database.js');
var conString = dbconfig.conString;

var client = new pg.Client(conString);


// LOAD UP THE USER MODEL
var User            = require('../app/models/user');


// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user.guid +" was seralized");
        done(null, user.guid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log(id + "is deserialized");
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function(callback) {


                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'email' :  email}, function(err, isNotAvailable, user) 
                {
                        console.log('User.findOne signup isNotAvailable == ', isNotAvailable);
                    // IF THERE ARE ANY ERRORS, RETURN THE ERROR
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (isNotAvailable == true) 
                    {
                        return done(null, false, {message:"Email exists, please login."}); //, req.flash('signupMessage', 'That email is already taken.')
                    } 
                    else 
                    {
                        // IF NO USER WITH EMAIL EXISTS -- CREATE NEW USER
                        user            = new User();

                        // set the user's local credentials
                        user.uname    = req.body.uname;
                        user.email    = req.body.email;
                        user.password = req.body.password;

                        user.save(function(newUser) {
                            console.log("USER.SAVE func == ", newUser);
                            passport.authenticate();
                            return done(null, newUser);
                            //newUser.password = newUser.generateHash(password);
                        });
                    }

                });

            });

        }));



    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form


            console.log('local-login function email == ', email);
            console.log('local-login function password == ', password);

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'email' :  email}, function(err, isNotAvailable, user) {
                // if there are any errors, return the error before anything else

                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, {message:"Incorrect username or password."}); // req.flash is the way to set flashdata using connect-flash  //, req.flash('loginMessage', 'No user found.')

                // if the user is found but the password is wrong
                //if (!user.validPassword(password))


                console.log(JSON.stringify(user) + ' User local-login');
                console.log(passwordHash.verify(password, user.password));

                if (!passwordHash.verify(password, user.password))
                    return done(null, false, {message:"Incorrect password."}); // create the loginMessage and save it to session as flashdata //, req.flash('loginMessage', 'Oops! Wrong password.')

                // all is well, return successful user
                return done(null, user, {message:"Success"});
            });

        }));

    };
