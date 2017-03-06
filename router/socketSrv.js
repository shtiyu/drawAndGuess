/**
 * Created by shtiyu on 17/2/23.
 */

let debug   = require('../lib/debug');
let usocket = []; //保存在线用户的socket


module.exports = function (io) {

    io.on('connection', function(socket){

        let userInfo  = socket.request.session.user;
        let sessionID = socket.request.session.id;

        if(!userInfo){
            socket.disconnect();
            return false;
        }

        let socketid = socket.id;
        let userid   = userInfo._id;
        let nickname = userInfo.name; //用户名

        //将用户的socket保存起来，用于私发消息
        usocket[userid] = socket;
        //进入房间
        io.sockets.emit('member enter', {userNum: 100, nickname : nickname});

        //离开房间
        socket.on('disconnect', function () {
            onlineModel.exit(userid).then(function () {
                onlineModel.count().then(function (result) {
                    return socket.broadcast.emit('user leave', {userNum : result, nickname : nickname})
                });
            }).catch(function (e) {
                debug.log(e.message);
            })
        });

        //收到消息
        socket.on('chat message', function (msg) {

            let time = currentTime();

            if(nickname == undefined){
                return false;
            }

            //判断是否还处于登录状态
            sessionModel.checkOnline(sessionID).then(function(result){
                //已被挤下线，发送消息通知用户下线
                if(!result || !result.session.user){
                    onlineModel.exitBySocketID(socketid).then(function(){
                        socket.emit('chat message', { nickname : "System message", message : "您已处于离线状态，请刷新页面重新登录", time : time});
                        socket.disconnect();
                    }).catch(function (e) {
                        debug.log(e.message);
                    })

                }else{
                    socket.broadcast.emit('chat message', {nickname: nickname, message : msg, time : time});
                }

            });

        });

    });

};