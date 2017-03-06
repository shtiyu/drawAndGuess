/**
 * Created by shtiyu on 17/3/3.
 */
let userModel = require('../lib/mongodb').User;
let crypto    = require('crypto');

//用户登录
exports.login = function(nickname, password, callback){

   userModel.findOne({ name : nickname}).exec().then(function(result){

        if(!result){
            return callback(false, '用户名或者密码错误。');
        }

        let salt   = result.salt;
        let dbpsw  = result.password;
        let sumPsw = crypto.createHmac('sha256', salt).update(password).digest('hex');

        if(dbpsw != sumPsw){
            return callback(false, '用户名或者密码错误。');
        }

       return callback(true, 'OK', result);

    }).catch(function(e){
       return callback(false, e.message);
    });

};

exports.createUser = function(user){

    //让create方法直接promise
    return new Promise(function(resolve, reject){

        userModel.create(user, function(error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });

    });

};