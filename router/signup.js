/**
 * Created by shtiyu on 17/3/1.
 */
let express = require('express');
let router  = express.Router();


router.get('/', function (req, res, next) {
    res.render('signup');
});

module.exports = router;