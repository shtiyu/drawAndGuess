let express = require('express');
let app     = express();
let path    = require('path');
let router  = require('./router');
let pkg     = require('./package.json');


global.DIR_ROOT = __dirname; //定义DIR_ROOT

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
    res.locals.title   = pkg.name;
    res.locals.errors  = '';
    res.locals.success = '';
    next();
});

//路由
router(app);




app.listen('3001', function () {
    console.log('app is running on port 3001');
});