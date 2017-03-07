/**
 * Created by shtiyu on 17/3/1.
 */
let debug = require('../lib/debug');
let util  = require('../lib/util');

module.exports = function (app) {
    app.get('/', util.checkLogin, function (req, res, next) {
        res.render('index');
    });

    app.use('/signup', require('./signup'));
    app.use('/signin', require('./signin'));
    app.use('/signout', require('./signout'));

    app.use(function (req, res, next) {
        if(!res.headersSent){
            debug.log('404-request url:' + req.url);
            res.render('404');
        }
        next();
    });
};