const formidable = require('formidable');
const fs = require('fs');
const pg = require('pg');

const dbconfig = require('../../config/database.js');
const conString = dbconfig.conString;

// load up the Upload model
const Upload  = require('../models/upload');

//all the routes for our application
module.exports = function(app, passport) {

    // =====================================
    // ROUTE TO DL RECORDINGS WEB PAGE =====
    // =====================================
    // show the login form
    app.get('/uploads', function(req, res) {
        Upload.getAllUploadsOnSystem("2", function(err, uploads) {
            req.uploads = uploads;

            //res.setHeader('Content-disposition', 'attachment; filename=recording.m4a');
            res.render('db.ejs', {uploads: req.uploads});
        });
    });


    // =====================================
    // LOGIN ===============================
    // =====================================
    app.post("/login", function(req, res, next) {
        // calls passport's local strategy to authenticate
        passport.authenticate("local-login", { session: false }, function(err, user, info) {
            // if any problems exist, error out
            if (err) {
                return next(err);
            }
            if (!user) 
            {
                res.json({user:user, messeage:info.message});
                //return res.send(500, info.message);
            }
            else
            {
                res.json({user:user, messeage:'success'});
            }

        })(req, res, next);
    });


    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.post("/signup", function(req, res, next) {
        // calls passport's local strategy to signup
        passport.authenticate("local-signup", { session: false }, function(err, user, info) {
            // if any problems exist, error out
            if (err) {
                return next(err);
            }
            if (!user) 
            {
                res.json({error:info.message});
            }
            else
            {
                res.json({user:user, messeage:'success'});
            }


        })(req, res, next);
    });

}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('isLoggedin');
        return next();
    }
    console.log('is not logged in');

    // if they aren't redirect them to the home page
    res.redirect('/');
}
