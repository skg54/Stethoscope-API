var pg = require('pg');
var moment = require('moment');
var dbconfig = require('../../config/database.js');

var conString = dbconfig.conString;
// git add .; git commit -am "Epoch ts";git push heroku master


function Group() {

    this.id = 0;
    this.name = "";
    this.guid = 0;
    this.numPatients = 0;
    this.timestamp = "";

    this.save = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

		client.query('INSERT INTO groups (name, guid, numPatients) VALUES($1, $2, $3)', [this.name, this.guid, this.numPatients], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM groups where guid=$1 ORDER BY id DESC', [this.guid], function (err, result) {
            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) {
                console.log(result.rows[0] + ' is found!');

                var groups = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
	                var group = new Group();

                    group.id = result.rows[i]['id'];
                    group.name = result.rows[i]['name'];
	                group.guid = result.rows[i]['guid'];
                    group.numPatients = result.rows[i]['numpatients'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    group.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

	                groups.push(group);
                };

                client.end();
                return callback(groups);
            }
        });
    };

    this.delete = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        client.query('DELETE FROM groups WHERE id=$1', [this.id], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
        });


        client.query('SELECT * FROM groups where guid=$1 ORDER BY id DESC', [this.guid], function (err, result) {
            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) {
                console.log(result.rows[0] + ' is found!');

                var groups = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
                    var group = new Group();

                    group.id = result.rows[i]['id'];
                    group.name = result.rows[i]['name'];
                    group.guid = result.rows[i]['guid'];
                    group.numPatients = result.rows[i]['numpatients'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    group.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

                    groups.push(group);
                };

                client.end();
                return callback(groups);
            }
            else
            {
                var groups = [];
                client.end();
                return callback(null, patients);
            }
        });

    }

    this.update = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        client.query('UPDATE groups SET name = $1 where id=$2', [this.name, this.id], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM groups where guid=$1 ORDER BY id DESC', [this.guid], function (err, result) {
            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) {
                console.log(result.rows[0] + ' is found!');

                var groups = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
                    var group = new Group();

                    group.id = result.rows[i]['id'];
                    group.name = result.rows[i]['name'];
                    group.guid = result.rows[i]['guid'];
                    group.numPatients = result.rows[i]['numpatients'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    group.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

                    groups.push(group);
                };

                client.end();
                return callback(groups);
            }
        });
    };
}


Group.getPatientGroupsForUserID = function(guid, callback) {

    var client = new pg.Client(conString);
    client.connect();

    client.query('SELECT * FROM groups where guid=$1 ORDER BY numpatients DESC', [guid], function (err, result) {
        if(err){
            return callback(null);
        }

        var groups = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var group = new Group();

            group.id = result.rows[i]['id'];
            group.name = result.rows[i]['name'];
            group.guid = result.rows[i]['guid'];

            group.numPatients = result.rows[i]['numpatients'];

            var yourDate = new Date(result.rows[i]['timestamp']);
            group.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

            groups.push(group);
        };

        //console.log('profile uploads = ', JSON.stringify(uploads));

        client.end();
        return callback(null, groups);
    });
}


module.exports = Group;
