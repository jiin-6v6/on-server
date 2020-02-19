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
    passport.deserializeUser(function (id, done) {
        var sql = 'SELECT id, name FROM manager WHERE id=?';
        conn.query(sql, [id], function(error, results){
            if(error){
                return done(error, false);
            }
            if(results[0]){
                var authData = {id : results[0].id, name: results[0].name, isAdmin: true};
                return done(null, authData);
            }
            var sql = 'SELECT id, name FROM user_info WHERE id=?';
            conn.query(sql, [id], function (error2, results2) {
                if (error2) {
                    return done(error2, false);
                }
                if (!results2[0]) {
                    return done(null, false);
                }
                var authData = { id: results2[0].id, name: results2[0].name, isAdmin: false};
                return done(null, authData);
            });
        });
    });

    passport.use(new LocalStrategy(
        {
        usernameField: 'login_id',
        passwordField: 'login_pwd'
        },
        function (username, password, done) {
            var sql = 'SELECT * FROM manager WHERE id=?';
            conn.query(sql, [username], function (error, results) {
                if (error) {
                    throw error;
                }
                if (results[0]) {   // it's admin account
                    if (password === results[0].pwd) {
                        return done(null, results[0]);
                    }
                    else {
                        return done(null, false, {
                            message: 'Incorrect password.'
                        });
                    }
                }
                else {  // not admin account
                    var sql = 'SELECT id, name, pwd FROM user_info WHERE id=?';
                    conn.query(sql, [username], function (error2, results2){
                        if(error2){
                            throw error2;
                        }
                        if(results2[0]){    // it's user account
                            if(password === results2[0].pwd){
                                return done(null, results2[0]);
                            }
                            else{
                                return done(null, false, {
                                    message: 'Incorrect password.'
                                });
                            }
                        }
                        else{
                            return done(null, false, {
                                messege: 'Incorrect id.'
                            });
                        }
                    });
                }
            });
        }
    ));
    return passport;
} 