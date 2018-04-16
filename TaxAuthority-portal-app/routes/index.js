const Client = require('node-rest-client').Client;
const stream = require('stream');
const client = new Client();
// IP Address of REST Server
const ipAddr = "localhost";

module.exports = function (app, taxAuth, port) {

    // ===========================
    // Home Page =================
    // ===========================
    app.get('/', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.TaxAuthority/" + taxAuth, function (data, response) {
            req.session.taxAuth = taxAuth;
            req.session.countryCode = data.countryCode;
            req.session.partners = data.partnerTaxAuth;
        });
        client.get("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.CbcReport", function (data, response) {
            let pendingEndorsement = 0;
            let reportReceived = 0;
            let reportReady = 0;
            for (i = 0; i < data.length; i++) {
                if (data[i].isEndorsed == "false") {
                    pendingEndorsement++;
                }
                if (data[i].sharedNode == "resource:org.acme.cbcreporting.SharedNode#" + req.session.countryCode) {
                    reportReceived++;
                }
                if (data[i].sharedCountryList.includes(req.session.countryCode)) {
                    reportReady++;
                }
            }
            let values = {
                "reportReceived": reportReceived,
                "pendingEndorsement": pendingEndorsement,
                "reportReady": reportReady,
                "partnersNum": req.session.partners.length
            }
            res.render('dashboard', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, values: values });
        });
    });

    // ===========================
    // Endorsement Page ==========
    // ===========================
    app.get('/endorse', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportListTAP", function (data, response) {
            res.render('endorse-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: null, endorseStatus: req.flash('endorseSuccess') });
        });
    });

    app.post('/endorse-filter', function (req, res) {
        let mne = req.body.mneID;
        let FY = req.body.financialYear;
        let args = {
            "mneFilter": mne,
            "fyFilter": FY
        };
        if (mne != "" && FY != "") {
            client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportFilterBothTAP?mneID=" + mne + "&financialYear=" + FY, function (data, response) {
                res.render('endorse-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: args, endorseStatus: req.flash('endorseSuccess') });
            });
        } else if (mne == "" && FY == "") {
            res.redirect('/endorse');
        } else {
            if (mne == "") mne = "unknown"
            if (FY == "") FY = "unknown"
            client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportFilterTAP?mneID=" + mne + "&financialYear=" + FY, function (data, response) {
                res.render('endorse-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: args, endorseStatus: req.flash('endorseSuccess') });
            });
        }
    });

    app.get('/endorse-report', function (req, res) {
        let args = {
            data: {
                "$class": "org.acme.cbcreporting.EndorseCbcReport",
                "reportID": req.query.reportID
            },
            headers: { "Content-Type": "application/json" }
        };

        client.post("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.EndorseCbcReport", args, function (data, response) {
            if (response.statusCode == "200") {
                req.flash('endorseSuccess', true);
            } else {
                req.flash('endorseSuccess', false);
            }
            res.redirect('/endorse');
        });
    });

    // Download specific CbC Report
    app.get('/download-cbcr', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportTAP?reportID=" + req.query.reportID, function (data, response) {
            var bitmap = new Buffer(data[0].dataFile, 'base64')
            var fileContents = Buffer.from(bitmap);
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
            res.set('Content-disposition', 'attachment; filename=' + data[0].reportName);
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            readStream.pipe(res);
        });
    });

    // ===========================
    // Retrieval Page ============
    // ===========================
    app.get('/retrieve', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportListTAP", function (data, response) {
            res.render('retrieve-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: null });
        });
    });

    app.post('/retrieve-filter', function (req, res) {
        let mne = req.body.mneID;
        let FY = req.body.financialYear;
        let args = {
            "mneFilter": mne,
            "fyFilter": FY
        };
        if (mne != "" && FY != "") {
            client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportFilterBothTAP?mneID=" + mne + "&financialYear=" + FY, function (data, response) {
                res.render('retrieve-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: args });
            });
        } else if (mne == "" && FY == "") {
            res.redirect('/retrieve');
        } else {
            if (mne == "") mne = "unknown"
            if (FY == "") FY = "unknown"
            client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportFilterTAP?mneID=" + mne + "&financialYear=" + FY, function (data, response) {
                res.render('retrieve-cbcr', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, reports: data, filter: args });
            });
        }
    });

    // Download endorsed CbC Report
    app.get('/download-endorsed-cbcr', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/queries/RetrieveCbcReportTAP?reportID=" + req.query.reportID, function (data, response) {
            var bitmap = new Buffer(data[0].dataFile, 'base64')
            var fileContents = Buffer.from(bitmap);
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
            res.set('Content-disposition', 'attachment; filename=' + data[0].reportName);
            res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            readStream.pipe(res);
        });
    });

    // ===========================
    // Partner TA Page ===========
    // ===========================
    app.get('/partners', function (req, res) {
        client.get("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.TaxAuthority/" + req.session.taxAuth, function (data, response) {
            res.render('partner-tax-authorities', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode, partners: data.partnerTaxAuth, addStatus: req.flash('addSuccess'), deleteStatus: req.flash('deleteSuccess') });
        });
    });

    app.get('/manage-partners', function (req, res) {
        res.render('manage-partner-tax-authorities', { taxAuth: req.session.taxAuth, countryCode: req.session.countryCode });
    });

    app.post('/add-partner', function (req, res) {
        let args = {
            data: {
                "$class": "org.acme.cbcreporting.AddPartnerTaxAuthority",
                "taxAuthID": req.session.taxAuth,
                "countryCode": req.body.partnerCountryCode
            },
            headers: { "Content-Type": "application/json" }
        };

        client.post("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.AddPartnerTaxAuthority", args, function (data, response) {
            if (response.statusCode == "200") {
                req.flash('addSuccess', true);
            } else {
                req.flash('addSuccess', false);
            }
            res.redirect('/partners');
        });
    });

    app.get('/delete-partner', function (req, res) {
        let args = {
            data: {
                "$class": "org.acme.cbcreporting.RemovePartnerTaxAuthority",
                "taxAuthID": req.session.taxAuth,
                "countryCode": req.query.id
            },
            headers: { "Content-Type": "application/json" }
        };

        client.post("http://" + ipAddr + ":" + port + "/api/org.acme.cbcreporting.RemovePartnerTaxAuthority", args, function (data, response) {
            if (response.statusCode == "200") {
                req.flash('deleteSuccess', true);
            } else {
                req.flash('deleteSuccess', false);
            }
            res.redirect('/partners');
        });
    });

};