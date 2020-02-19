module.exports = function (app) {

    var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
    var mysql = require('mysql');

    // mysql connection
    var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'mintchoco',
        database: 'community'
    });
    conn.connect();

    // login-passport
    app.use(passport.initialize());
    app.use(passport.session());

    // login 성공 시에 session에 저장하도록 1번만 로드되는 함수
    passport.serializeUser(function (user, done) {
        console.log('serialize');
        done(null, user.id);
    });

    // 다른 페이지 방문 시 로그인 했는지 안했는지 확인하는 함수
    passport.deserializeUser(function (id, done) {
        console.log('deserialize');
        done(null, id);
    });

    passport.use(new LocalStrategy(
        {
        usernameField: 'login_id',
        passwordField: 'login_pwd'
        },
        function (username, password, done) {
            var sql = 'SELECT id, pwd FROM user_info WHERE id=?';
            conn.query(sql, [username], function (error, results, field) {
                if (error) {
                    throw error;
                }
                if (results[0] === undefined) {
                    console.log('Incorrect username');
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                }
                else {
                    if (password === results[0].pwd) {
                        console.log('성공');
                        return done(null, results[0]);
                    }
                    else {
                        console.log('Incorrect paassword');
                        return done(null, false, {
                            message: 'Incorrect password.'
                        });
                    }
                }
            });
        }
    ));
    return passport;
} 