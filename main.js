var express = require('express');
var app = express();

app.use(express.static('statics')); // for window10, it should be on top

var fs = require('fs');
var flash = require('connect-flash');
var path = require('path');
var qs = require('querystring');
var bodyParser = require('body-parser');
var compression = require('compression');
var mysql = require('mysql');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var template = require('./lib/template.js');

var wrongPath = false;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    cookie: { secure: false, maxAge: 7200000 },
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        user: 'root',
        password: 'mintchoco',
        database: 'community'
    })
}));
app.use(flash());   // Since it uses session, please write after app.use(session)
var passport = require('./lib/passport.js')(app);   // it should be located after app.use(flash())

//app.get('/', (req, res) => res.send('Hello World!'))
app.get('*', function (request, response, next) {
    fs.readdir('./data', function (error, filelist) {
        request.list = filelist;
        next();
    });
});

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

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});