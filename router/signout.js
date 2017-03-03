/**
 * Created by shtiyu on 17/3/3.
 */
let express = require('express');
let Router  = express.Router();
let util    = require('../lib/util');

Router.get('/', util.checkLogin,function(req, res, next){
    req.session.user = null;
    res.redirect('/signin');
});


module.exports = Router;