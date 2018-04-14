const fs = require('fs');
const stream = require('stream');
const Client = require('node-rest-client').Client;
const client = new Client();
// IP Address of REST Server
const ipAddr = "192.168.0.119";
// Port 3001 for SharedNode SG
const port = "3001";

module.exports = function (app, passport) {

    // ===========================
    // Home (Login) Page =========
    // ===========================
    app.get('/', function (req, res) {
        res.render('index', { message: req.flash('loginMessage'), user: req.user });
    });

    // Process login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    // ===========================
    // Submit CbCR Page ==========
    // ===========================
    app.get('/submit-cbcr', isLoggedIn, function (req, res) {
        res.render('submit-cbcr', { uploadStatus: req.flash('uploadSuccess'), reupload: false, reportArgs: null, user: req.user });
    });

    app.post('/submit-cbcr', isLoggedIn, function (req, res) {
        let file = req.files.CbcReport;
        let reportID = req.user.mne_id + '_' + new Date().getTime();
        let filename = req.user.mne_id + '_FY' + req.body.financialYear + '.xlsx';

        file.mv(__dirname + '/../reports/' + filename, function (err) {
            if (err) {
                req.flash('uploadSuccess', false);
                return res.redirect('/submit-cbcr');
            }

            if (req.body.reupload == "true") {
                // Reupload an CbC Report for selected financial year
                let oldReportID = req.body.reportID;
                let args = {
                    data: {
                        "$class": "org.acme.cbcreporting.UpdateCbcReport",
                        "reportID": oldReportID,
                        "reportName": filename,
                        "mneID": req.user.mne_id,
                        "dataFile": base64_encode(__dirname + '/../reports/' + filename),
                        "financialYear": parseInt(req.body.financialYear),
                        "subsidiaryCountryCode": [req.body.selected_countries]
                    },
                    headers: { "Content-Type": "application/json" }
                };

                client.post("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.UpdateCbcReport", args, function (data, response) {
                    if (response.statusCode == "200") {
                        req.flash('uploadSuccess', true);
                    } else {
                        req.flash('uploadSuccess', false);
                    }
                    res.redirect('/submit-cbcr');
                });
            } else {
                // New CbC Report will be committed to the blockchain
                let args = {
                    data: {
                        "$class": "org.acme.cbcreporting.CreateCbcReport",
                        "reportID": reportID,
                        "reportName": filename,
                        "mneID": req.user.mne_id,
                        "dataFile": base64_encode(__dirname + '/../reports/' + filename),
                        "financialYear": parseInt(req.body.financialYear),
                        "subsidiaryCountryCode": [req.body.selected_countries]
                    },
                    headers: { "Content-Type": "application/json" }
                };

                client.post("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.CreateCbcReport", args, function (data, response) {
                    if (response.statusCode == "200") {
                        req.flash('uploadSuccess', true);
                    } else {
                        req.flash('uploadSuccess', false);
                    }
                    res.redirect('/submit-cbcr');
                });
            }
        });
    });

    // ===========================
    // Manage CbCR Page ==========
    // ===========================

    // Get the list of CbC Reports submitted by the MNE
    app.get('/manage-cbcr', isLoggedIn, function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportListMNEP?mneID=" + req.user.mne_id, function (data, response) {
            res.render('manage-cbcr', { reports: data, user: req.user });
        });
    });

    // Download specific CbC Report
    app.get('/download-cbcr', isLoggedIn, function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportMNEP?reportID=" + req.query.reportID, function (data, response) {
            var bitmap = new Buffer(data[0].dataFile, 'base64')
            var fileContents = Buffer.from(bitmap);
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
            res.set('Content-disposition', 'attachment; filename=' + data[0].reportName);
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            readStream.pipe(res);
        });
    });

    // Reupload specific CbC Report
    app.post('/resubmit-cbcr', isLoggedIn, function (req, res) {
        let args = {
            "reportID": req.body.rID,
            "financialYear": req.body.FY,
            "subsidiaryCountryCode": req.body.subsidiaries
        };
        res.render('submit-cbcr', { uploadStatus: req.flash('uploadSuccess'), reupload: true, reportArgs: args, user: req.user });
    });

    // ===========================
    // Logout ====================
    // ===========================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// Check if the user has logged in to the system
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

// function to encode CbC Report (.xlsx) to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}