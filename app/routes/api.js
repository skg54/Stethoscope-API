const express = require('express')
const router = express.Router();

const formidable = require('formidable');
const fs = require('fs');
const pg = require('pg');

const async = require('async');
const moment = require('moment');

const AWS = require('aws-sdk');

const dbconfig = require('../../config/database.js');
const conString = dbconfig.conString;

// LOAD UP DATA MODELS
const User    = require('../models/user');
const Patient = require('../models/patient');
const Upload  = require('../models/upload');
const Group   = require('../models/patientGroup');

// git add .; git commit -m "improvements"; git push heroku master;
    
    // =====================================
    // SAVE PATIENT PROFILE INFO ===========
    // =====================================
    // CALLED TO SAVE PATIENT META INFO TO S3 BUCKET AND DB
    router.post('/patient/info/save', function (req, res) {

        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {

            var s3  = new AWS.S3({
              accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
              region: 'us-east-1',
            });

            var file = files.profile;

            var s3key = fields.s3Key;
            console.log('patient s3key == ', s3key);
            console.log('patient file.path == ', file.path);


            fs.readFile(file.path, function(err, contents) {

                var params = {
                  Key:    s3key,
                  Bucket: process.env.BUCKETEER_BUCKET_NAME,
                  Body:   contents,
                  ACL:    'public-read'
                };

                s3.putObject(params, function put(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        return;
                    } else {
                        console.log('S3 file.name == ', data);
                    }
                });
            });


            console.log('patient/info files == ', files);
            console.log('patient/info fields == ', fields);

            var patientObj = new Patient();
            
            patientObj.name = fields.name;
            patientObj.firstname = fields.firstname;
            patientObj.lastname = fields.lastname;
            patientObj.guid = fields.guid;
            patientObj.dob = moment(fields.dob);
            patientObj.notes = fields.notes;
            patientObj.sex = fields.sex;
            patientObj.imgurl = fields.imgurl;
            patientObj.group_id = fields.groupid;
            patientObj.totalRecordings = fields.total;
    
            patientObj.save(function(err, patients) {

                req.patients = patients;
                var lastPatient = patients[0];

                console.log('lastPatient patient ==', lastPatient);

                res.json({
                    success: 'yes',
                    "patients": patients
                });

            });

        });

    });


    // =====================================
    // UPDATE PATIENT PROFILE INFO ===========
    // =====================================
    // CALLED TO UPDATE PATIENT META INFO TO S3 BUCKET AND DB
    router.post('/patient/info/update', function (req, res) {

        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {

            var imgURL;

            if (fields.hasPic == 'yes') 
            {

                var s3  = new AWS.S3({
                  accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
                  secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
                  region: 'us-east-1',
                });

                var file = files.profile;

                var s3key = fields.s3Key;
                console.log('patient s3key == ', s3key);
                console.log('patient file.path == ', file.path);


                fs.readFile(file.path, function(err, contents) {

                    var params = {
                      Key:    s3key,
                      Bucket: process.env.BUCKETEER_BUCKET_NAME,
                      Body:   contents,
                      ACL:    'public-read'
                    };

                    s3.putObject(params, function put(err, data) {
                        if (err) {
                            console.log(err, err.stack);
                            return;
                        } else {
                            console.log('S3 file.name == ', data);
                        }
                    });
                });
            }
            else
            {
            }

            var patientObj = new Patient();
            
            patientObj.id = fields.patient_id;
            patientObj.name = fields.name;
            patientObj.firstname = fields.firstname;
            patientObj.lastname = fields.lastname;
            patientObj.guid = fields.guid;
            patientObj.dob = moment(fields.dob);
            patientObj.notes = fields.notes;
            patientObj.sex = fields.sex;
            patientObj.imgurl = fields.imgurl;
            patientObj.group_id = fields.groupid;
            patientObj.totalRecordings = fields.total;

            patientObj.update(function(err, patients) {
                console.log('patient update ==', patients);
                req.patients = patients;
                var lastPatient = patients[0];

                res.json({
                    success: 'yes',
                    "patients": lastPatient
                });
            });

        });
    });


    // =====================================
    // GET ALL PATIENT RECORDINGS FOR DOCTOR
    // =====================================
    // 
    router.get('/recording/:patient_id', function(req, res) {

        var patient_id = req.params.patient_id; 

        console.log('all recordings for patient == ', patient_id);

        Upload.getUploadsForPatient(patient_id, function(err, patients) {
            res.json({
                success: "yes",
                "recordings": patients
            });
        });   
    });

    // =====================================
    // GET PATIENT RECORDINGS FOR A DATE
    // =====================================
    // 
    router.get('/recording/:patient_id/:date', function(req, res) {

        var patient_id = req.params.patient_id; 
        var dateStr = req.params.date; 

        console.log('getUploadsForPatientOnDate route dateStr == ', dateStr);

        Upload.getUploadsForPatientOnDate(patient_id, dateStr, function(err, patients) {
            res.json({
                success: "yes",
                "recordings": patients
            });
        });   
    });


    // =====================================
    // SAVE PATIENT RECORDING ==============
    // =====================================
    // CALLED TO SAVE PATIENT RECORDING TO S3 BUCKET AND DB
    router.post('/recording/save', function (req, res) {

        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {

            console.log('recording/save files == ', files);
            console.log('recording/save fields == ', fields);

            var s3  = new AWS.S3({
              accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
              region: 'us-east-1',
            });

            var file = files.audio;

            var s3key = fields.guid+'/'+fields.patient_id+'/'+fields.filename;
            //var s3key = fields.s3key;
            console.log('uploadfile s3key == ', s3key);

            console.log('uploadfile file.name == ', fields.filename);
            console.log('uploadfile file.path == ', file.path);


            fs.readFile(file.path, function(err, contents) {

                var params = {
                  Key:    s3key,
                  Bucket: process.env.BUCKETEER_BUCKET_NAME,
                  Body:   contents,
                  ACL:    'public-read'
                };

                s3.putObject(params, function put(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        return;
                    } else {
                        console.log('S3 file.name == ', data);
                    }
                });
            });


            var upload  = new Upload();

            upload.name = fields.name;
            upload.guid = fields.guid;
            upload.patient_id = fields.patient_id;
            upload.filename = fields.filename;
            upload.url = fields.url;
            upload.region = fields.region;
            upload.temperature = fields.temperature;
            upload.filename = fields.filename;
            upload.duration = fields.duration;
            upload.bpm = fields.bpm;

            upload.save(function(uploads) {
                console.log("Upload SAVED!!!");
                res.json({
                    success: 'yes',
                    uploads: uploads
                });
            });
        });
    
    });

    // =====================================
    // DELETE PATIENT RECORDING ============
    // =====================================
    // CALLED TO DELETE PATIENT RECORDING
    router.post('/recording/delete', function (req, res) {

        var upload  = new Upload();
        upload.id = req.body.recordingID;
        upload.guid = req.body.guid;
        upload.patient_id = req.body.patient_id;

        upload.delete(function(uploads) {
            console.log("Upload DELETED!!!");
            res.json({
                success: 'yes',
                uploads: uploads
            });
        });

    });

    // =====================================
    // ADD NEW PATIENT GROUP ===============
    // =====================================
    // CALLED TO ADD NEW PATIENT GROUP
    router.post('/group/new', function (req, res) {

        var group  = new Group();

        group.name = req.body.name;
        group.guid = req.body.guid;

        group.save(function(groups) {
            console.log("/group/new CALLED; ALL GROUPS == ", groups);
	        res.json({
	            success: 'yes',
	            groups: groups
	        });
        });
    });

    // =====================================
    // UPDATE PATIENT GROUP ================
    // =====================================
    // CALLED TO UPDATE EXISTING PATIENT GROUP NAME
    router.post('/group/update', function (req, res) {

        var group  = new Group();

        group.name = req.body.name;
        group.guid = req.body.guid;
        group.id = req.body.id;

        console.log('UPDATE PATIENT GROUP ==', group);

        group.update(function(groups) {
            console.log("/group/update CALLED; ALL GROUPS == ", groups);
	        res.json({
	            success: 'yes',
	            groups: groups
	        });
        });
    });


    // =====================================
    // DELETE PATIENT GROUP ================
    // =====================================
    // CALLED TO UPDATE EXISTING PATIENT GROUP NAME
    router.post('/group/delete', function (req, res) {

        var group  = new Group();

        group.id = req.body.groupid;
        group.guid = req.body.guid;

        group.delete(function(groups) {
            console.log("/DELETE GROUP CALLED; ALL GROUPS == ", groups);
            res.json({
                success: 'yes',
                groups: groups
            });
        });
    });
    

    // =====================================
    // GET ALL PATIENT GROUPS FOR DOCTOR ===
    // =====================================
    // 
    router.get('/groups/:guid', function(req, res) {

        var guid = req.params.guid; 

        console.log('geonames == ', req.query);

        Group.getPatientGroupsForUserID(guid, function(err, groups) {
            res.json({
                success: 'yes',
                groups: groups
            });
        });    
    });


    // =====================================
    // GET ALL PATIENTS FOR GROUP ==========
    // =====================================
    // 
    router.get('/patients/:groupID', function(req, res) {

        var groupID = req.params.groupID; 

        console.log('patients FOR GROUP == ', groupID);

        Patient.getPatientsForGroupID(groupID, function(err, patients) {
            res.json({
                success: 'yes',
                "patients": patients
            });
        });    
    });


    // =====================================
    // ADD NEW PATIENT TO GROUP ============
    // =====================================
    // CALLED TO ADD PATIENT TO EXISTING GROUP
    router.post('/patients/save', function (req, res) {

		async.eachSeries(req.body, function(patient, callback) 
		{
			var patientObj  = new Patient();
			console.log('async.each patient ==', patient);
			
			patientObj.name = patient.name;
			patientObj.guid = patient.guid;
			patientObj.dob = moment(patient.dob);
			patientObj.group_id = patient.groupid;
            patientObj.totalRecordings = patient.total;
	
	        patientObj.save(function(err, patients) {
	        	console.log('async.each patient ==', patients);
	        	req.patients = patients;
	            callback(null, patients);
	        });
		}, 
		function(err, patients) 
		{
		    if(err)
		    {
		      console.log("error ocurred in each", err);
		    } 
		    else
		    {
	            //res.json({patients:patients});
	            console.log("/addPatients finished == ", req.patients);

		        res.json({
		            success: 'yes',
		            patients: req.patients
		        });
		    }
		});
    });

    // =====================================
    // DELETE PATIENT FROM GROUP ===========
    // =====================================
    // CALLED TO ADD PATIENT TO EXISTING GROUP
    router.post('/patient/delete', function (req, res) {

        console.log('patient delete ==', req.body.patientID);
        var patientObj  = new Patient();
        patientObj.id = req.body.patientID;
        patientObj.group_id = req.body.groupid;

        patientObj.delete(function(err, patients) {
            console.log('patient delete ==', patients);
            res.json({
                success: 'yes',
                "patients": patients
            });
        });
    });

    // =====================================
    // UPDATE PATIENT INFO  ================
    // =====================================
    // CALLED TO ADD PATIENT TO EXISTING GROUP
    router.post('/patient/bulkupdate', function (req, res) {

        async.eachSeries(req.body, function(patient, callback) 
        {
            var patientObj  = new Patient();
            console.log('async.each bulkupdate ==', patient);
            
            patientObj.id = patient.patientID;
            patientObj.name = patient.name;
            patientObj.guid = patient.guid;
            patientObj.dob = moment(patient.dob);
            patientObj.group_id = patient.groupid;
            patientObj.totalRecordings = patient.total;
    
            patientObj.update(function(err, patients) {
                //console.log('async.each bulkupdate ==', patients);
                req.patients = patients;
                callback(null, patients);
            });
        }, 
        function(err, patients) 
        {
            if(err)
            {
              console.log("error ocurred in each", err);
            } 
            else
            {
                //res.json({patients:patients});
                console.log("/bulkupdate finished == ", req.patients);

                res.json({
                    success: 'yes',
                    patients: req.patients
                });
            }
        });

    });

    // =====================================
    // UPDATE PATIENT INFO  ================
    // =====================================
    // CALLED TO ADD PATIENT TO EXISTING GROUP
    router.post('/patient/update', function (req, res) {

        console.log('patient update ==', req.body.patientID);
        var patientObj  = new Patient();
        patientObj.id = req.body.patientID;
        patientObj.name = req.body.name;
        patientObj.group_id = req.body.groupid;
        patientObj.dob = moment(req.body.dob);


        patientObj.update(function(err, patients) {
            console.log('patient update ==', patients);
            res.json({
                success: 'yes',
                "patients": patients
            });
        });
    });

    module.exports = router;
