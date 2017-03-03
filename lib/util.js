/**
 * Created by shtiyu on 17/2/16.
 */
let util = {

    randString : function(len){
        len = len || 32;
        let chat = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz1234567890';
        let maxLength  = chat.length;
        let randString = '';
        for(let i = 0; i < len; i++){
            randString += chat.charAt(Math.floor(Math.random() * maxLength));
        }

        return randString;

    },

    checkLogin : function (req, res, next) {

        if(!req.session.user){
            req.flash('errors', '未登录');
            return res.redirect('/signin');
        }

        next();
    },

    checkNoLogin : function (req, res, next) {

        if(req.session.user){
            req.flash('已登录');
            return res.redirect('/');
        }

        next();
    },

    /**
     * 时间格式化函数
     * @param format  Y:年 m:月 d:天 H:时 i:分 s:秒
     * @returns {XML|string}
     */
    date : function(format){
        let curDate = new Date();
        let year  = curDate.getFullYear();
        let month = curDate.getMonth() + 1;
        let day   = curDate.getDate();
        let hour  = curDate.getHours();
        let min   = curDate.getMinutes();
        let sec   = curDate.getSeconds();

        month = util.pad(month, 2);
        day   = util.pad(day, 2);
        hour  = util.pad(hour, 2);
        min   = util.pad(min, 2);
        sec   = util.pad(sec, 2);

        return format.replace('Y', year).replace('m', month).replace('d', day).replace('H', hour).replace('i', min).replace('s', sec);

    },

    pad : function() {
        let tbl = [];
        return function(num, n) {
            let len = n-num.toString().length;
            if (len <= 0) return num;
            if (!tbl[len]) tbl[len] = (new Array(len+1)).join('0');
            return tbl[len] + num;
        }
    }()

};

module.exports = util;