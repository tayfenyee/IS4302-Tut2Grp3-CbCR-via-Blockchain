module.exports = function (app) {

    // ===========================
    // Home Page =================
    // ===========================
    app.get('/', function (req, res) {
        res.render('dashboard');
    });

    // ===========================
    // Endorsement Page ==========
    // ===========================
    app.get('/endorse', function (req, res) {
        res.render('endorse-cbcr');
    });

    // ===========================
    // Retrieval Page ============
    // ===========================
    app.get('/retrieve', function (req, res) {
        res.render('retrieve-cbcr');
    });

    // ===========================
    // Partner TA Page ===========
    // ===========================
    app.get('/partners', function (req, res) {
        res.render('partner-tax-authorities');
    });

    app.get('/manage-partners', function (req, res) {
        res.render('manage-partner-tax-authorities');
    });
};