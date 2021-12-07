var pg = require('pg');
var moment = require('moment');
var _ = require('lodash');
var dbconfig = require('../../config/database.js');

var conString = dbconfig.conString;
// git add . ; git commit -am "delete upload/recording call"; git push heroku master


function Upload() {

    this.id = 0;
    this.name = "";
    this.guid = 0;
    this.patient_id = 0;
    this.filename = "";
    this.url = "";
    this.region = "";
    this.duration = "";
    this.temperature = "";
    this.bpm = "";
    this.timestamp = "";
    this.date = "";
    this.dateStr = "";

    this.save = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

		client.query('INSERT INTO uploads (name, guid, patient_id, url, filename, region, duration, temperature, bpm) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [this.name, this.guid, this.patient_id, this.url, this.filename, this.region, this.duration, this.temperature, this.bpm], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('UPDATE patients SET totalrecordings = totalrecordings+1 where id=$1', [this.patient_id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM uploads where guid=$1 ORDER BY id DESC', [this.guid], function (err, result) {
            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                console.log(result.rows[0] + ' is found!');

                var uploads = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
	                var upload = new Upload();

                    upload.id = result.rows[i]['id'];
                    upload.name = result.rows[i]['name'];
	                upload.guid = result.rows[i]['guid'];
                    upload.patient_id = result.rows[i]['patient_id'];
                    upload.region = result.rows[i]['region'];
                    upload.duration = result.rows[i]['duration'];
                    upload.filename = result.rows[i]['filename'];
                    upload.url = result.rows[i]['url'];
                    upload.temperature = result.rows[i]['temperature'];
                    upload.bpm = result.rows[i]['bpm'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

	                uploads.push(upload);
                };

                client.end();
                return callback(uploads);
            }
        });
    };


    this.delete = function(callback) {

        var client = new pg.Client(conString);
        client.connect();

        client.query('DELETE FROM uploads WHERE id=$1', [this.id], function (err, result) {
            if(err){
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('UPDATE patients SET totalrecordings = totalrecordings-1 where id=$1', [this.patient_id], function (err, result) {
            if(err)
            {
                console.log(err);
                return console.error('error running query', err);
            }
        });

        client.query('SELECT * FROM uploads where patient_id=$1 ORDER BY id DESC', [this.patient_id], function (err, result) {
            if(err){
                return callback(null);
            }

            //if no rows were returned from query, then new user
            if (result.rows.length > 0) 
            {
                console.log(result.rows[0] + ' is found!');

                var uploads = [];

                for (var i = 0; i < result.rows.length ; i++) 
                {
                    var upload = new Upload();

                    upload.id = result.rows[i]['id'];
                    upload.name = result.rows[i]['name'];
                    upload.guid = result.rows[i]['guid'];
                    upload.patient_id = result.rows[i]['patient_id'];
                    upload.url = result.rows[i]['url'];
                    upload.region = result.rows[i]['region'];
                    upload.duration = result.rows[i]['duration'];
                    upload.filename = result.rows[i]['filename'];
                    upload.temperature = result.rows[i]['temperature'];
                    upload.bpm = result.rows[i]['bpm'];

                    var yourDate = new Date(result.rows[i]['timestamp']);
                    upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

                    upload.date = moment(yourDate).format("MM/DD/YYYY");
                    upload.dateStr = yourDate;

                    uploads.push(upload);
                };

                var groupedResults = _.groupBy(uploads, function (result) {
                  return moment(result['dateStr']).startOf('day').format("MM/DD/YYYY");
                });

                var result = _.map(groupedResults, function(group, day){
                    return {
                        day: day,
                        recordings: group
                    }
                });

                var reverseUploads = result.reverse();

                client.end();
                return callback(reverseUploads);
            }
        });
    }
}


Upload.getUploadsForPatient = function(patient_id, callback) {

    var client = new pg.Client(conString);
    client.connect();

    client.query('SELECT * FROM uploads where patient_id=$1 ORDER BY id DESC', [patient_id], function (err, result) {
        if(err)
        {
            return callback(null);
        }

        var uploads = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var upload = new Upload();

            upload.id = result.rows[i]['id'];
            upload.name = result.rows[i]['name'];
            upload.guid = result.rows[i]['guid'];
            upload.patient_id = result.rows[i]['patient_id'];
            upload.url = result.rows[i]['url'];
            upload.region = result.rows[i]['region'];
            upload.duration = result.rows[i]['duration'];
            upload.filename = result.rows[i]['filename'];
            upload.temperature = result.rows[i]['temperature'];
            upload.bpm = result.rows[i]['bpm'];

            var yourDate = new Date(result.rows[i]['timestamp']);
            upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

            upload.date = moment(yourDate).format("M/DD/YYYY");
            upload.dateStr = yourDate;

            uploads.push(upload);
        };

        //console.log('uploads uploads = ', JSON.stringify(uploads));

        var groupedResults = _.groupBy(uploads, function (result) {
          return moment(result['dateStr']).startOf('day').format("M/DD/YYYY");
        });

        var result = _.map(groupedResults, function(group, day) {
            return {
                day: day,
                recordings: group
            }
        });

        var reverseUploads = result.reverse();

        client.end();
        return callback(null, reverseUploads);
    });
}

Upload.getAllUploadsOnSystem = function(patient_id, callback) {

    var client = new pg.Client(conString);
    client.connect();

    client.query('SELECT * FROM uploads ORDER BY id DESC', function (err, result) {
        if(err)
        {
            return callback(null);
        }

        var uploads = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var upload = new Upload();

            upload.id = result.rows[i]['id'];
            upload.name = result.rows[i]['name'];
            upload.guid = result.rows[i]['guid'];
            upload.patient_id = result.rows[i]['patient_id'];
            upload.url = result.rows[i]['url'];
            upload.region = result.rows[i]['region'];
            upload.duration = result.rows[i]['duration'];
            upload.filename = result.rows[i]['filename'];
            upload.temperature = result.rows[i]['temperature'];
            upload.bpm = result.rows[i]['bpm'];

            var yourDate = new Date(result.rows[i]['timestamp']);
            upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

            upload.date = moment(yourDate).format("M/DD/YYYY");
            upload.dateStr = yourDate;

            uploads.push(upload);
        };

        //console.log('uploads uploads = ', JSON.stringify(uploads));

        var groupedResults = _.groupBy(uploads, function (result) {
          return moment(result['dateStr']).startOf('day').format("M/DD/YYYY");
        });

        var result = _.map(groupedResults, function(group, day) {
            return {
                day: day,
                recordings: group
            }
        });

        client.end();
        return callback(null, result.reverse());
    });
}

Upload.getUploadsForPatientOnDate = function(patient_id, date, callback) 
{
    //select * from the_table where the_timestamp_column::date = date '2015-07-15';

    var client = new pg.Client(conString);
    client.connect();

    client.query('SELECT id, name, guid, patient_id, url, region, duration, filename, temperature, timestamp, timestamp::date as date FROM uploads where timestamp::date BETWEEN $1 AND $2 AND patient_id=$3 ORDER BY id DESC', [date, date, patient_id], function (err, result) {
        if(err)
        {
            return callback(null);
        }

        var uploads = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var upload = new Upload();

            upload.id = result.rows[i]['id'];
            upload.name = result.rows[i]['name'];
            upload.guid = result.rows[i]['guid'];
            upload.patient_id = result.rows[i]['patient_id'];
            upload.url = result.rows[i]['url'];
            upload.region = result.rows[i]['region'];
            upload.duration = result.rows[i]['duration'];
            upload.filename = result.rows[i]['filename'];
            upload.temperature = result.rows[i]['temperature'];
            upload.bpm = result.rows[i]['bpm'];

            var date = new Date(result.rows[i]['date']);
            upload.date = moment(date).format("M/DD/YYYY");

            var yourDate = new Date(result.rows[i]['timestamp']);
            upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

            uploads.push(upload);
        };

        console.log('getUploadsForPatientOnDate uploads = ', JSON.stringify(uploads));

        client.end();
        return callback(null, uploads);
    });

}

Upload.getUserUploads = function(guid, callback) 
{
    var client = new pg.Client(conString);
	client.connect();

    client.query('SELECT * FROM uploads where guid=$1 ORDER BY id DESC', [guid], function (err, result) {
        if(err)
        {
            return callback(null);
        }

        var uploads = [];

        for (var i = 0; i < result.rows.length ; i++) 
        {
            var upload = new Upload();

            upload.id = result.rows[i]['id'];
            upload.name = result.rows[i]['name'];
            upload.guid = result.rows[i]['guid'];
            upload.patient_id = result.rows[i]['patient_id'];
            upload.url = result.rows[i]['url'];
            upload.region = result.rows[i]['region'];
            upload.duration = result.rows[i]['duration'];
            upload.filename = result.rows[i]['filename'];
            upload.temperature = result.rows[i]['temperature'];
            upload.bpm = result.rows[i]['bpm'];

            var yourDate = new Date(result.rows[i]['timestamp']);
            upload.timestamp = moment(yourDate).subtract(5, 'hours').format('lll');

            uploads.push(upload);
        };

        //console.log('profile uploads = ', JSON.stringify(uploads));

        client.end();
        return callback(null, uploads);
    });
}


module.exports = Upload;
