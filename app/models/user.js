var pg = require('pg');
var passwordHash = require('password-hash');
var dbconfig = require('../../config/database.js');

var conString = dbconfig.conString;

function User() {

    this.guid = 0;
    this.uname = "";
    this.photo = "";
    this.email = "";
    this.password = "";

    this.save = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        var hashedPassword = passwordHash.generate(this.password);

        client.query('INSERT INTO users(name, photo, email, password) VALUES($1, $2, $3, $4)', [this.uname, this.photo, this.email, hashedPassword], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
            //console.log(this.email);
        });

        client.query('SELECT guid, name, photo, email, password FROM users ORDER BY guid desc limit 1', null, function(err, result) {

            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                var user = new User();

                user.guid = result.rows[0]['guid'];
                user.uname = result.rows[0]['name'];
                user.photo = result.rows[0]['photo'];
                user.email = result.rows[0]['email'];
                user.password = result.rows[0]['password'];

                client.end();
                return callback(user);
            }
        });
    };
}


User.findOne = function(userInput, callback) {

    var client = new pg.Client(conString);

    var isNotAvailable = false; //we are assuming the email is taken
    //var email = this.email;
    //var rowresult = false;

    var email = userInput.email;

    console.log('EMAIL FINDONE func == ', email);


    //check if there is a user available for this email;
    client.connect();

    client.query("SELECT guid, name, photo, email, password FROM users where email=$1", [email], function(err, result){
        if(err)
        {
            return callback(err, isNotAvailable, this);
        }

        //if no rows were returned from query, then new user
        var user = new User();

        if (result.rows.length > 0)
        {
            isNotAvailable = true; // update the user for return in callback

            //console.log(email + ' email is not available!');

            user.guid = result.rows[0]['guid'];
            user.uname= result.rows[0]['name'];
            user.photo = result.rows[0]['photo'];
            user.email = result.rows[0]['email'];
            user.password = result.rows[0]['password'];
        }
        else
        {
            isNotAvailable = false;
            //email = email;
        }

        //console.log('EMAIL FINDONE isNotAvailable == ', user);

        client.end();

        //console.log(' User object == ', JSON.stringify(user));
        return callback(false, isNotAvailable, user);

    });
};

User.findById = function(id, callback) {

    console.log('EMAIL findById func == ', id);
    var client = new pg.Client(conString);

    client.connect();
    client.query("SELECT guid, name, photo, email, password FROM users where guid=$1", [id], function(err, result){

        if(err)
        {
            return callback(err, null);
        }

        //if no rows were returned from query, then new user
        if (result.rows.length > 0)
        {
            var user = new User();
            user.guid = result.rows[0]['guid'];
            user.uname= result.rows[0]['name'];
            user.photo = result.rows[0]['photo'];
            user.email= result.rows[0]['email'];
            user.password = result.rows[0]['password'];


            return callback(null, user);
        }
        client.end();
    });
};

module.exports = User;
