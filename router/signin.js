/**
 * Created by shtiyu on 17/3/1.
 */
let router    = require('express').Router();
let util      = require('../lib/util');
let userModel = require('../models/user');

router.get('/', util.checkNoLogin,function (req, res, next) {
    res.render('signin');
});

router.post('/', util.checkNoLogin, function (req, res, next) {

    let nickname = req.body.nickname;
    let password = req.body.password;

    userModel.login(nickname, password, function(state, message, data){

        if(state == false){
            req.flash('errors', message);
            return res.redirect('back');
        }

        delete data.password;
        delete data.salt;

        req.session.user = data;
        return res.redirect('/');

    });

    next();

});


module.exports = router;