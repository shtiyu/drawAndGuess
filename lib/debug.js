/**
 * Created by shtiyu on 17/3/1.
 */
let fs    = require('fs');
let path  = require('path');
let util  = require('./util');
let debug = {

    log : function (msg, filePath) {
        if(!filePath){
            filePath = path.join(DIR_ROOT, 'logs', "system_error_"+util.date("Y_m_d")+".log");
        }

        msg = "[" + util.date('Y-m-d H:i:s') +"]" + msg + "\r\n";

        let writeStream = fs.createWriteStream(filePath, { flags : 'a', defaultEncoding : 'utf8'} );
        writeStream.write(msg);
    }

};
module.exports = debug;