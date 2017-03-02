/**
 * Created by shtiyu on 17/3/1.
 */
let express = require('express');
let router = express.Router();
let path   = require('path');
let fs     = require('fs');
let multer = require('multer');
let debug  = require('../lib/debug');
let util   = require('../lib/util');

let storage = multer.diskStorage({

    destination : function (req, file, cb) {
        cb(null, path.join(DIR_ROOT, 'public','uploads'))
    },

    filename : function (req, file, cb) {

        let ext    = file.originalname.substr(file.originalname.lastIndexOf('.'));
        let rename = util.randString('6') +"_"+ Date.now();
        if(ext == ""){
            ext = 'jpeg';
        }

        cb(null, rename + ext);
    }
});


let upload = multer({
       storage : storage,
       limits  : { fileSize : 100 * 1000 },
    fileFilter : filter
}).single('avatar');


function filter(req, file, cb){

    if(file.mimetype != 'image/jpeg' && file.mimetype != 'image/jpg'){
        cb(new Error('请上传jpeg/jpg格式。'));
    }

    cb(null, true);
}

router.get('/', function (req, res, next) {
    res.render('signup');
});


router.post('/',function (req, res, next) {

    upload(req, res, function (err) {

        if (err) {

            let msg = err.message;
            if(err.code === 'LIMIT_FILE_SIZE'){
                msg = '请上传小于100KB的文件。';
            }

            res.render('signup', { errors : msg });
        }

        console.log(req.file);
        console.log(req.body);

    });


});



module.exports = router;