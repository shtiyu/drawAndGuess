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

    app.use(function (err, req, res, next) {
        debug.log(err.stack);
        next();
    });

    //没有获取到的错误，全到这里，主要是为了防止socket.io抛出的错误crash服务器
    process.on('uncaughtException', (err) => {
        debug.log(err.stack);
    });

};