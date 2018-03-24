module.exports = function (app, passport) {

    // ===========================
    // Home (Login) Page =========
    // ===========================
    app.get('/', function (req, res) {
        res.render('index', { message: req.flash('loginMessage'), user: req.user });
    });

    // process login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/manage-cbcr',
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
        res.render('submit-cbcr', { uploadStatus: req.flash('uploadSuccess'), user: req.user });
    });

    app.post('/submit-cbcr', function (req, res) {
        let file = req.files.CbcReport;
        let filename = req.user.mne_id + '_FY' + req.body.financialYear + '_' + new Date().getTime() + '.xlsx';

        file.mv(__dirname + '/../reports/' + filename, function (err) {
            if (err) {
                req.flash('uploadSuccess', false);
                return res.redirect('/submit-cbcr');
            }

            CbcReport = {
                id: 123,
                name: filename,
                financialYear: req.body.financialYear,
                mne_id: req.user.mne_id,
                dataFile: file,
                subsidiaryCountryCodes: [req.body.selected_countries]
            };

            // CbcReport will be passed over to Hyperledger Fabric to commit to the blockchain
            // console.log(JSON.stringify(CbcReport));
            req.flash('uploadSuccess', true);
            res.redirect('/submit-cbcr');
        });
    });

    // ===========================
    // Manage CbCR Page ==========
    // ===========================
    app.get('/manage-cbcr', isLoggedIn, function (req, res) {
        res.render('manage-cbcr', { user: req.user });
    });

    // ===========================
    // Logout ====================
    // ===========================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// check if the user has logged in to the system
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}