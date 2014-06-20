module.exports = {
    index: function(req, res) {
        res.render('index', { message: 'Hello' });
    }
};
