/**
 * Created by shtiyu on 17/3/1.
 */
let debug = require('../lib/debug');

module.exports = function (app) {
    app.get('/', function (req, res, next) {
        res.redirect('/signup');
    });

    app.use('/signup', require('./signup'));

    // app.get('/singin', require('./signin'));


    app.use(function (err, req, res, next) {
        debug.log(err.stack);
        next();
    });

    app.use(function (req, res, next) {
        if(!res.headersSent){
            res.render('404');
        }
    });
};