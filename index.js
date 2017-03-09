let express = require('express');
let app     = express();
let path    = require('path');
let router  = require('./router');
let pkg     = require('./package.json');
let flash   = require('connect-flash');
let config  = require('config-lite');
let session = require('express-session');
let mongoStore = require('connect-mongo')(session);
let bodyParser = require('body-parser');
let server     = require('http').createServer(app);
let io         = require('socket.io')(server);
let debug      = require('./lib/debug');
let ioSrv      = require('./router/socketSrv');

global.DIR_ROOT = __dirname; //定义DIR_ROOT

app.set('views', 'views');  //定义views视图目录
app.set('view engine', 'ejs'); //定义模板引擎
app.use(express.static(path.join(__dirname, 'public'))); //设置静态文件目录

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


let sessionMiddle = session({
    key    : config.session.key,
    secret : config.session.secrect,
    resave : config.session.resave,
    cookie : { maxAge : 3600 * 1000 },
    store  : new mongoStore({ url : config.mongodb, ttl : 60 * 15, stringify : false }),
    saveUninitialized : config.session.saveUninitialized
});


io.use(function (socket, next) {
    sessionMiddle(socket.request, socket.request.res, next);
});


app.use(sessionMiddle);
app.use(flash());

app.use(function (req, res, next) {
    res.locals.title   = pkg.name;
    res.locals.errors  = req.flash('errors').toString();
    res.locals.success = req.flash('success').toString();
    next();
});

//路由
router(app);
ioSrv(io);

server.listen(config.port, function () {
    console.log('app is running on port 3001');
});