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
let userMod = require('../models/user');
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
       limits  : { fileSize : 100 * 1000 }
}).single('avatar');


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

        let psw      = req.body.password;
        let repsw    = req.body.repassword;
        let nickname = req.body.nickname;
        let ava_path = '';
        let filename = '';

        try{

            if(!req.file){
                throw new Error('请上传头像。');
            }

            filename = req.file.filename;
            ava_path = req.file.path;

            if(req.file.mimetype != 'image/jpeg' && req.file.mimetype != 'image/jpg'){
                throw new Error('请上传jpeg/jpg格式。');
            }

            if(psw.length < 6){
                throw new Error('密码长度应该在6位以上。');
            }

            if(psw != repsw){
                throw new Error('两次密码输入不一致。');
            }

        }catch (e){
            if(ava_path != ""){
                fs.unlink(ava_path);
            }
            req.flash('errors', e.message);
            return res.redirect('signup');
        }

        //入库
        let attribute = { name : nickname, password : psw, avatar : filename };

        userMod.createUser(attribute).then(function(result){

            req.session.user = { id : result._id, name : result.name, avatar : result.avatar };
            return res.redirect('/');

        }).catch(function(err){

            fs.unlink(ava_path);
            if(err.message.match('E11000 duplicate key')){
                req.flash('errors', '用户名已被注册');
                return res.redirect('signup');
            }

            next(err);
        });

    });


});



module.exports = router;