$(function() {

	var socket = io();

	//画布
	var previewLayer = $('#previewLayer');
	var draw_context;
	var prev_content;
	var canvasTop;  //画板顶部跟屏幕顶部的距离
	var canvasLeft; //画板左边跟屏幕左边的距离
	var startX;
	var startY;
	var canvasWidth=900;
	var canvasHeight=500;


	//画笔
	var size = 1;
	var color  = '#000000';
	var canDraw = false;
	
	//初始化画布，把canvas对象赋给全局变量
	var initCanvas = function(){

		prev_content = document.getElementById("previewLayer").getContext('2d')
		prev_content.width = canvasWidth;
		prev_content.height = canvasHeight;
		canvasTop    = previewLayer.offset().top;
		canvasLeft   = previewLayer.offset().left;

	}

	var clearCtx = function(){
		prev_content.clearRect(0,0,canvasWidth,canvasHeight);
	}

	var emitMousedown=function(){
		socket.emit('mousedown')
	}

	var mousedown = function(e){

		prev_content.strokeStyle = color;
		prev_content.lineWidth = size;
		
		e = e || window.event;
		startX  = e.clientX - canvasLeft;
		startY  = e.clientY - canvasTop;

		socket.emit('mousedown', {x : startX, y : startY, color : color, size : size});

		prev_content.beginPath();
		prev_content.moveTo(startX, startY);

		canDraw = true;
		
	}

	var mouseup = function(e){
		socket.emit('mouseup');
		canDraw = false;
	}

	var mousemove = function(e){

		if(!canDraw){
			return;
		}

		e = e || window.event;
		var x = e.clientX - canvasLeft;
		var y = e.clientY - canvasTop;

		socket.emit('mousemove', {x : x, y : y});

		prev_content.lineTo(x, y);
		prev_content.stroke();
	}

	var setArtist = function(sid){
		$('.userDiv').removeClass('light');
		$.each($('.userDiv'), function(){
			if($(this).attr('data-sid') == sid){
				$(this).addClass('light');
				return false;
			}
		});
	}

	var initStage=function(players, artist, leaderBoard){
		
		if(players){
			var html = '';
			for(var i = 0; i < players.length; i++){
				var _v = players[i];
				html += "<div class='userDiv' title='"+_v.nickname+"' data-sid='"+_v.userid+"'><img src='/uploads/"+_v.avatar+"' /></div>"
			}

			$('.playerArea').html(html);
		}
		
		if(leaderBoard){
			var leaderHtml  = '';
			$.each(leaderBoard, function(_k, _v){
				leaderHtml += "<li>"+_v.nickname + ":" + _v.score +"</li>";
			});

			$('.leaderboard-ul').html(leaderHtml);	
		}
	}

	socket.on('mousedown', function(data){
		canDraw = true;
		prev_content.strokeStyle = data.color;
		prev_content.lineWidth   = data.size;
		prev_content.beginPath();
		prev_content.moveTo(data.x, data.y);
	});

	socket.on('mousemove', function(data){
		if(!canDraw){
			return;
		}
		prev_content.lineTo(data.x, data.y);
		prev_content.stroke();
	});

	socket.on('mouseup', function(){
		canDraw=false;
	});


	socket.on('member enter', function(data){
		var msg = '系统消息：'+data.message;
		appendMsg(msg, 'systemMsg');
		//playerArea

		var tips    = data.question;
		var players = data.players;
		var artist  = data.artist;
		var leaderBoard = data.leaderBoard;

		initStage(players, artist, leaderBoard);
	});

	socket.on('member leave', function(data){
		var msg = '系统消息：'+data.message;
		appendMsg(msg, 'systemMsg');

		initStage(data.players, data.artist, data.leaderBoard);
	});

	function appendMsg(msg, type){
		$("<li>", {
			class : type,
			text : msg
		}).appendTo('.chatUl');
		$('.chatArea').scrollTop(999999);
	}


	$('.js-size').click(function(){
		$('.js-size').find('div').removeClass('select')
		$(this).find('div').eq(0).addClass('select');
		size = $(this).attr('data-size');
	});

	$('.js-color').click(function(){
		$('.js-color').find('div').removeClass('select')
		$(this).find('div').eq(0).addClass('select');
		color = $(this).attr('data-color');
	});

	var setChatHeight = function(){
		var w_height = $(window).height();
		var c_height = w_height - 500 - 60 - 40;
		$('.chatArea').css('height', c_height + "px");
		$('.main').css('height', $(document).height());
	}

	$(window).resize(function(){
		setChatHeight()
	});
	
	initCanvas();
	setChatHeight();

	$('.js-rubber').click(function(){
		socket.emit('clear ctx');
		clearCtx();
	});

	//聊天
	$('.chatInput').trigger('focus');
	$('form').submit(function(){
		var oriMsg  = $('.chatInput').val();
		
		if(oriMsg == "" || oriMsg == undefined){
			return false;
		}

		$('.chatInput').val('');
		socket.emit('chat message', oriMsg);

		return false;
	});

	socket.on('chat message', function(data){
		var msg = data.nickname + " : " + data.message;
		appendMsg(msg);
	});
	

	//作为画家得到的消息
	socket.on('get question', function(data){
		clearCtx();
		setArtist(data.artist.sid)
		var answer = data.question.answer;
		appendMsg('系统消息：'+data.message, 'systemMsg');
		$('.questionArea').html(answer);
		$('.chatInput').attr('disabled', 'disbaled');
		$('.tools').removeClass('hide');
		previewLayer.addClass('pencil').removeClass('not-allowed');
		previewLayer.bind('mouseup', mouseup);
		previewLayer.bind('mousedown', mousedown);
		previewLayer.bind('mousemove', mousemove);
	});

	socket.on('game start', function(data){
		clearCtx();
		setArtist(data.artist.sid)
		appendMsg('系统消息：'+data.message, 'systemMsg');
		$('.questionArea').html(data.tips);
		$('.chatInput').removeAttr('disabled');
		$('.tools').addClass('hide');
		previewLayer.addClass('not-allowed').removeClass('pencil');
		previewLayer.unbind('mouseup', mouseup);
		previewLayer.unbind('mousedown', mousedown);
		previewLayer.unbind('mousemove', mousemove);
	});
	
	socket.on('game result', function(data){
		appendMsg('系统消息：'+data.message, 'systemMsg');
		var leaderBoard = data.leaderBoard;
		var leaderHtml  = '';
		$.each(leaderBoard, function(_k, _v){
			leaderHtml += "<li>"+_v.nickname + ":" + _v.score +"</li>";
		});

		$('.leaderboard-ul').html(leaderHtml);
	});

	socket.on('counting down', function(data){
		$('.countingDown').html(data.countDown)
	});

	socket.on('system message', function(data){
		appendMsg('系统消息：'+data.message, 'systemMsg');
	});

	socket.on('init stage', function(data){
		initStage(data.players, data.artist, data.leaderBoard);
	});

	socket.on('clear ctx', function(){
		clearCtx();
	});
	
})