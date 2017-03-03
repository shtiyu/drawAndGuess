/**
 * Created by shtiyu on 17/3/3.
 */
let config   = require('config-lite');
let mongoose = require('mongoose');
let crypto   = require('crypto');

mongoose.Promise = Promise;
mongoose.connect(config.mongodb);

let Schema     = mongoose.Schema;

//用户表
let userSchema = new Schema({
    name     : { type : String, index : true, unique: true},
    password : String,
    salt     : String,
    avatar   : String,
    date     : { type: Date, default: new Date() },
});

userSchema.pre('save', function(next){

    let psw  = this.password;
    let salt = crypto.randomBytes(16).toString('hex');

    psw = crypto.createHmac('sha256', salt).update(psw).digest('hex');

    this.password = psw;
    this.salt     = salt;

    next();
});

exports.User = mongoose.model('User', userSchema);