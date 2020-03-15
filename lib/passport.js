module.exports = function (app) {

    var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
    var mysql = require('mysql');
    var crypto = require('crypto');

    // mysql connection
    var conn;
    function handleDisconnect() {
        conn = mysql.createConnection({
            host: 'db.kikijo.gabia.io',
            user: 'kikijo',
            password: 'mintchoco9597',
            database: 'dbkikijo',
            dateStrings: 'date'
        });
        conn.connect(function (err) {
            if (err) {
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000);
            }
        });
        conn.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                return handleDisconnect();
            } else {
                throw err;
            }
        });
    }
    handleDisconnect();

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
        conn.query(sql, [id], function (error, results) {
            if (error) {
                return done(error, false);
            }
            if (results[0]) {
                var authData = { id: results[0].id, name: results[0].name, isAdmin: true };
                return done(null, authData);
            }
            var sql = 'SELECT id, name, state FROM user_info WHERE id=?';
            conn.query(sql, [id], function (error2, results2) {
                if (error2) {
                    return done(error2, false);
                }
                if (!results2[0]) {
                    return done(null, false);
                }
                if (results2[0].state == 1) {
                    // 탈퇴한 경우 alert 창을 어떻게 띄울 것인가
                }
                if (results2[0].state == 2) {
                    // 강퇴당한 경우 alert 창을 어떻게 띄울 것인가
                }
                var authData = { id: results2[0].id, name: results2[0].name, isAdmin: false };
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
                    crypto.pbkdf2(password, results[0].salt, 112311, 64, 'sha512', (err, derivedKey) => {
                        if (err) {
                            throw err;
                        }
                        var hashingPwd = derivedKey.toString('hex');
                        if (hashingPwd === results[0].pwd) {
                            return done(null, results[0]);
                        }
                        else {
                            return done(null, false, {
                                message: 'Incorrect password.'
                            });
                        }
                    })
                }
                else {  // not admin account
                    var sql = 'SELECT id, salt, name, pwd FROM user_info WHERE id=? AND state=0';
                    conn.query(sql, [username], function (error2, results2) {
                        if (error2) {
                            throw error2;
                        }
                        if (results2[0]) {    // it's user account
                            crypto.pbkdf2(password, results2[0].salt, 112311, 64, 'sha512', (err, derivedKey) => {
                                if (err) {
                                    throw err;
                                }
                                var hashingPwd = derivedKey.toString('hex');
                                if (hashingPwd === results2[0].pwd) {
                                    return done(null, results2[0]);
                                }
                                else {
                                    return done(null, false, {
                                        message: 'Incorrect password.'
                                    });
                                }
                            });
                        }
                        else {
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