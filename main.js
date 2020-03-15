var express = require('express');
var app = express();

app.use(express.static('statics')); // for window10, it should be on top

var flash = require('connect-flash');
var fs = require('fs');
var qs = require('querystring');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var http = require('http');
var https = require('https');
/*var options = {
    key: fs.readFileSync(),
    cert: fs.readFileSync()
};*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(cookieParser());
app.use(function (req, res, next) {
    if (Object.keys(req.cookies).length === 1 && req.cookies.once_logined){ // alert 세션 만료 띄우는 플래그 설정
        req.cookies.once_logined = false;
    }
    next();
});
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    cookie: { secure: false, maxAge: 7200000 },
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'db.kikijo.gaio.io',
        user: 'kikijo',
        password: 'mintchoco9597',
        database: 'dbkikijo'
    })
}));
app.use(function (req, res, next) {
    if (req.session.passport && req.cookies.once_logined === undefined){ // 브라우저 껐다 다시 킬 때 로그아웃하게 만듦
        req.session.destroy();
        res.redirect('/');
    }
    else
        next();
});
app.use(flash());   // Since it uses session, please write after app.use(session)
var passport = require('./lib/passport.js')(app);   // it should be located after app.use(flash())

//app.get('/', (req, res) => res.send('Hello World!'))
// app.get('*', function (request, response, next) {
//     fs.readdir('./data', function (error, filelist) {
//         request.list = filelist;
//         next();
//     });
// });

//route, routing
var indexRouter = require('./route/index');
var boardRouter = require('./route/board');
var commentRouter = require('./route/comment');
var loginRouter = require('./route/auth')(passport);
var myinfoRouter = require('./route/my_info');
var adminRouter = require('./route/admin');
var reportRouter = require('./route/report');

app.use('/', indexRouter);
app.use('/board', boardRouter);
app.use('/comment', commentRouter);
app.use('/auth', loginRouter);
app.use('/my_info', myinfoRouter);
app.use('/admin', adminRouter);
app.use('/report', reportRouter);

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, function(){
    console.log('Example app listening on port 8080!');
})

// http.createServer(app).listen(80, function(){
//     console.log('Example app listening on port 80!')
// });
// https.createServer(app).listen(443);