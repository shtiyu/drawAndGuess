/**
 * Created by shtiyu on 17/2/23.
 */

let debug         = require('../lib/debug');
let questionHouse = require('../models/questionHouse');
let usocket     = []; //保存在线用户的socket
let min_player	= 3;  //最小游戏者
let max_player  = 7;  //最大游戏者
let players = []; //当前玩家
let viewers = []; //当前观众
let artist ;      //当前画家
let artistIndex;  //当前画家位置
let question;
let countDown;    //倒计时

//玩家加入游戏
function userEnter(socket, io) {

    let userInfo  = socket.request.session.user;

    let userid   = userInfo._id;
    let nickname = userInfo.name; //用户名
    let avatar   = userInfo.avatar; //用户名

    //将用户的socket保存起来，用于私发消息
    usocket[userid] = socket;
    userNum  = usocket.length;
    let data = { nickname : nickname, userid : userid, avatar : avatar };

    if(userNum < min_player){
        message = nickname + "加入游戏！再等一会，游戏马上开始！";
        players.push(data);
    }else if(userNum > max_player){
        message = nickname + "以观众身份进入游戏！";
        viewers.push(data);
    }else{
        players.push(data);
        message = nickname + "加入游戏！";
        if(question != undefined){
            message += "下一局就能上啦 ！你也可以尝试猜猜本题。";
        }
    }

    if(artist == undefined){
        artist = players[0];
        artistIndex = 0;
    }

    io.sockets.emit('member enter', {message : message, nickname : nickname});
    
    if(players.length == min_player && question == undefined){
        gameBegin();
    }

    return true;
}

//用户离开房间
function userLeave(socket) {
    return function(){

        let userid    = socket.request.session.user._id;
        let nickname  = socket.request.session.user.name;
        let message   = nickname + "离开了房间。";

        //TODO 如果是画手离开触发下一局游戏
        leaveRoom(userid);
        socket.broadcast.emit('member leave', {nickname : nickname, message : message});
        return true;
    }
}

//把用户移出列表
function leaveRoom(userid){

    delete(usocket[userid]);

    for(let i = 0; i < players.length; i++){
        if(players[i].userid == userid){
            players.splice(i, 1);
            break;
        }
    }

    for(let i = 0; i < viewers.length; i++){
        if(viewers[i].userid == userid){
            viewers.splice(i, 1);
            break;
        }
    }

    if(artist && artist.userid == userid){
        artist = undefined;
        return 1;
    }

    return 0;
}


//检查答案是否正确
function checkAnswer(message, sid){

    return false;
}

//游戏开始
function gameBegin(){
    //取出一道题目
    question  = questionHouse.getQuestion();
    countDown = 60;
    //给画家发送一个消息
    let aSocket = usocket[artist.sid];
    aSocket.emit('get question', {artist : artist, question : question, message : '你是这局的灵魂画手，请开始你的表演，题目是：'+question.answer});

    //给所有人发送游戏开始
    let gameStartMsg = artist.nickname + "开始画，提示：" + question.tips;
    aSocket.broadcast.emit('game start', { artist : artist, message : gameStartMsg, tips : question.tips });

    //定时60秒后结束游戏
    time_out = setTimeout(function(){
        // nextGame(false)
    }, 60000);

    count_down_id = setInterval(function(){
        countDown--;

        io.sockets.emit('counting down', {countDown : countDown});

        if(countDown <= 1){
            clearTimeout(count_down_id);
        }

    }, 1000);

}

module.exports = function (io) {

    io.on('connection', function(socket){

        let userInfo  = socket.request.session.user;

        if(!userInfo){
            socket.disconnect();
            return false;
        }

        let nickname  = userInfo.name;
        let userid    = userInfo._id;
        //进入房间
        userEnter(socket, io);

        //离开房间
        socket.on('disconnect', userLeave(socket));

        //收到消息
        socket.on('chat message', function (message) {
            let rs = checkAnswer(message, userid);
            if(rs == false){
                io.sockets.emit('chat message', {nickname : nickname, message : message});
            }
        });

    });

};