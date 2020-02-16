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
        done(null, user.id);
    });

    // 다른 페이지 방문 시 로그인 했는지 안했는지 확인하는 함수
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy(
        {
        usernameField: 'id',
        passwordField: 'pwd'
        },
        function (username, password, done) {
            var sql = 'SELECT id, pwd FROM user_info WHERE id=?';
            conn.query(sql, [username], function (error, results, field) {
                if (error) {
                    throw error;
                }
                if (results[0] === undefined) {
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                }
                else {
                    if (password === results[0].pwd) {
                        return done(null, results[0]);
                    }
                    else {
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