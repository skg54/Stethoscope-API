const pg = require('pg');
const moment = require('moment');
const dbconfig = require('../../config/database.js');

const conString = dbconfig.conString;
// git add . ; git commit -am "order patient feed by number of recordings";git push heroku master


function Patient() {

    this.id = 0;
    this.name = "";
    this.firstname = "";
    this.lastname = "";
    this.dob = "";
    this.sex = "";
    this.notes = "";
    this.imgurl = "";
    this.guid = 0;
    this.group_id = 0;
    this.timestamp = "";
    this.totalRecordings = 0;

    this.save = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

		client.query('INSERT INTO patients (name, firstname, lastname, dob, sex, notes, imgurl, group_id, guid, totalrecordings) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [this.name, this.firstname, this.lastname, this.dob, this.sex, this.notes, this.imgurl, this.group_id, this.guid, this.totalRecordings], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('UPDATE groups SET numpatients = numpatients + 1 WHERE id = $1', [this.group_id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM patients where group_id=$1 ORDER BY id DESC', [this.group_id], function (err, result) {

            if(err)
            {
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                console.log(result.rows[0] + ' is found!');

                var patients = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
	                var patient = new Patient();

                    patient.id = result.rows[i]['id'];
                    patient.name = result.rows[i]['name'];
                    patient.firstname = result.rows[i]['firstname'];
                    patient.lastname = result.rows[i]['lastname'];
                    //patient.dob = result.rows[i]['dob'];
                    var dobDate = new Date(result.rows[i]['dob']);
                    patient.dob = moment(dobDate).format('M/DD/YYYY');
                    patient.sex = result.rows[i]['sex'];
                    patient.notes = result.rows[i]['notes'];
                    patient.imgurl = result.rows[i]['imgurl'];
                    patient.group_id = result.rows[i]['group_id'];
                    patient.guid = result.rows[i]['guid'];
                    patient.totalRecordings = result.rows[i]['totalrecordings'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    patient.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

	                patients.push(patient);
                };

                client.end();
                return callback(null, patients);
            }
        });
    };


    this.update = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        client.query('UPDATE patients SET name = $1, firstname = $2, lastname = $3, dob = $4, sex = $5, notes = $6, imgurl = $7 WHERE id = $8', [this.name, this.firstname, this.lastname, this.dob, this.sex, this.notes, this.imgurl, this.id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM patients where id=$1', [this.id], function (err, result) {
            if(err)
            {
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                console.log(result.rows[0] + ' is found!');

                var patients = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
                    var patient = new Patient();

                    patient.id = result.rows[i]['id'];
                    patient.name = result.rows[i]['name'];
                    patient.firstname = result.rows[i]['firstname'];
                    patient.lastname = result.rows[i]['lastname'];
                    //patient.dob = result.rows[i]['dob'];
                    var dobDate = new Date(result.rows[i]['dob']);
                    patient.dob = moment(dobDate).format('M/DD/YYYY');
                    patient.sex = result.rows[i]['sex'];
                    patient.notes = result.rows[i]['notes'];
                    patient.imgurl = result.rows[i]['imgurl'];
                    patient.group_id = result.rows[i]['group_id'];
                    patient.guid = result.rows[i]['guid'];
                    patient.totalRecordings = result.rows[i]['totalrecordings'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    patient.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

                    patients.push(patient);
                };

                client.end();
                return callback(null, patients);
            }
        });

    }


    this.delete = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        client.query('DELETE FROM patients WHERE id = $1', [this.id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('UPDATE groups SET numpatients = numpatients - 1 WHERE id = $1', [this.group_id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM patients where group_id=$1 ORDER BY id DESC', [this.group_id], function (err, result) {
            if(err)
            {
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                console.log(result.rows[0] + ' is found!');

                var patients = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
                    var patient = new Patient();

                    patient.id = result.rows[i]['id'];
                    patient.name = result.rows[i]['name'];
                    patient.firstname = result.rows[i]['firstname'];
                    patient.lastname = result.rows[i]['lastname'];
                    //patient.dob = result.rows[i]['dob'];
                    var dobDate = new Date(result.rows[i]['dob']);
                    patient.dob = moment(dobDate).format('M/DD/YYYY');
                    patient.sex = result.rows[i]['sex'];
                    patient.notes = result.rows[i]['notes'];
                    patient.imgurl = result.rows[i]['imgurl'];
                    patient.group_id = result.rows[i]['group_id'];
                    patient.guid = result.rows[i]['guid'];
                    patient.totalRecordings = result.rows[i]['totalrecordings'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    patient.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

                    patients.push(patient);
                };

                client.end();
                return callback(null, patients);
            }
            else
            {
                var patients = [];
                client.end();
                return callback(null, patients);
            }
        });
    }

}


Patient.getPatientsForGroupID = function(group_id, callback) {

    var client = new pg.Client(conString);
    client.connect();

    client.query('SELECT * FROM patients where group_id=$1 ORDER BY totalrecordings DESC', [group_id], function (err, result) {
        if(err)
        {
            return callback(null);
        }

        var patients = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var patient = new Patient();

            patient.id = result.rows[i]['id'];
            patient.name = result.rows[i]['name'];
            patient.firstname = result.rows[i]['firstname'];
            patient.lastname = result.rows[i]['lastname'];

            var dobDate = new Date(result.rows[i]['dob']);
            patient.dob = moment(dobDate).format('M/DD/YYYY');
            patient.sex = result.rows[i]['sex'];
            patient.notes = result.rows[i]['notes'];
            patient.imgurl = result.rows[i]['imgurl'];

            patient.group_id = result.rows[i]['group_id'];
            patient.guid = result.rows[i]['guid'];
            patient.totalRecordings = result.rows[i]['totalrecordings'];

            var yourDate = new Date(result.rows[i]['timestamp']);
            patient.timestamp = moment(yourDate).subtract(5, 'hours').fromNow();

            patients.push(patient);
        };

        //console.log('profile uploads = ', JSON.stringify(uploads));

        client.end();
        return callback(null, patients);
    });
}


module.exports = Patient;
