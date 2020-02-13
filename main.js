var express = require('express');
var app = express();
var fs = require('fs');
var flash = require('connect-flash');
var path = require('path');
var qs = require('querystring');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var template = require('./lib/template.js');


var wrongPath = false;

app.use(express.static('statics'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
    secret: 'asadlfkj!@#!@#dfgasdg',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
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
var loginRouter = require('./route/auth')(passport);

app.use('/', indexRouter);
app.use('/board', boardRouter);
app.use('/auth', loginRouter);

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});