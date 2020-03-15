var express = require('express');
var router = express.Router();
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var fetch = require('node-fetch');
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.json({ extended: false });
var crypto = require('crypto');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

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

router.get('/', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var login = auth.statusUI(request, response);
    var sql = "SELECT id, email, name, birth, report_cnt FROM user_info WHERE id=?";
    conn.query(sql, [request.user.id], function (error, results, field) {
        if (error) {
            throw error;
        }
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        var content = template.myinfo(results);
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.get('/update', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var user_id = request.user.id;
    var select_sql = 'SELECT * FROM user_info WHERE id=?';

    conn.query(select_sql, [user_id], function (error, data) {
        if (error) throw error;
        var post = { user_id: `${data[0].id}`, user_birth: `${data[0].birth}`, user_email: `${data[0].email}` };
        var login = auth.statusUI(request, response);
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        var content = template.update(post);
        var html = template.basic(title, login, nav, content);
        response.send(html);
        // 아이디 변경시 세션 수정해야됨 근데 sql 세션id값이랑 web 세션id값이랑 다름
    })
});

router.post('/updatePwd', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    // var post = request.body;
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
        </nav>`;
    var content = template.updatePwd();
    var html = template.basic(title, login, nav, content);
    response.send(html);
});

router.post('/checkPwd', urlencodedParser, function (request, response) {
    var checkingPwd = request.body.pwd;
    var salt = '';
    var hashingPwd = '';
    var select_sql = 'SELECT * FROM user_info WHERE id=?';

    conn.query(select_sql, [request.user.id], function (error, results) {
        if (error) {
            throw error;
        }
        salt = results[0].salt;

        // hashing
        crypto.pbkdf2(checkingPwd, salt, 112311, 64, 'sha512', (err, derivedKey) => {
            if (err) throw err;
            hashingPwd = derivedKey.toString('hex');
            if (results[0].pwd === hashingPwd) response.send({ msg: 'OK', value: true });
            else response.send({ msg: '비밀번호를 확인해주세요.', value: false });
        });
    });
});

router.post('/update_process', urlencodedParser, function (request, response) { // id변경시 session 삭제해야됨
    var post = request.body;
    var checkingId = request.body.auth_id;
    var update_sql = 'UPDATE user_info SET id=?, birth=?, email=? WHERE id=?';
    var success_sql = 'SELECT EXISTS(SELECT * FROM user_info WHERE id =?) AS SUCCESS';

    // 아이디 중복 확인
    conn.query(success_sql, [checkingId], function (error, results) {
        if (error) {
            throw error;
        }
        // console.log(results[0].SUCCESS); // 있으면 1 없으면 0 return

        if (results[0].SUCCESS && request.session.passport.user !== checkingId) { // 다른 아이디가 이미 존재하는 경우
            response.send({ msg: "입력정보를 확인해주세요.", value: false, idChanged: false });
        } else {
            // update
            conn.query(update_sql, [post.auth_id, post.auth_birth, post.auth_email, request.user.id], function (error2, data2) {
                if (error2) throw error2;
                console.log(checkingId, request.user.id);
                if (checkingId === request.user.id) {
                    response.send({ msg: "회원정보가 수정되었습니다.", value: true, idChanged: false });
                } else {
                    response.send({ msg: "회원정보가 수정되었습니다.", value: true, idChanged: true });
                }
                // 아이디 변경시 세션 수정해야됨 근데 sql 세션id값이랑 web 세션id값이랑 다름
            })
        }
    });
});

router.post('/updatePwd_process', function (request, response) {
    var salt = '';
    var hashingPwd = '';
    var sessionID = request.sessionID;
    // var findSessionId = /(?<=.{4}).+(?=[\.])/;

    var selectSalt_sql = 'SELECT salt FROM user_info WHERE id=?';
    var update_sql = 'UPDATE user_info SET pwd=? WHERE id=?';
    var deleteSession_sql = 'DELETE FROM SESSIONS WHERE session_id=?';

    // salt 값 탐색
    conn.query(selectSalt_sql, [request.user.id], function (error1, data1) {
        if (error1) throw error1;
        salt = data1[0].salt;

        // password hashing
        crypto.pbkdf2(request.body.new_pwd1, salt, 112311, 64, 'sha512', (err, derivedKey) => {
            if (err) throw err;
            hashingPwd = derivedKey.toString('hex');

            // password update
            conn.query(update_sql, [hashingPwd, request.user.id], function (error2, data2) {
                if (error2) throw error2;

                // session 삭제
                conn.query(deleteSession_sql, [sessionID], function (error3, data3) {
                    if (error3) throw error3;
                    response.redirect('/auth/login');
                })
            })
        }
        )
    });
});

router.get('/alarm/:this_page', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
        </nav>`;
    var content = ``;
    var sql = 'SELECT * FROM alarm WHERE alarmed_id=? AND isCheck=0 AND alarmed_id != alarming_id';
    conn.query(sql, [request.user.id], function (error, results) {
        if (error) {
            console.log(error);
            throw error;
        }
        if (!results[0]) {
            content = `<div id="content">알림이 없습니다.</div>`;
        }
        else {
            var total_page = parseInt((results.length - 1) / 10) + 1;
            if (this_page > total_page) {
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = template.alarmlist(results, this_page);
            content += template.pagination_alarmlist(this_page, total_page);
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/alarm/view_process', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE alarm SET isCheck=1 WHERE comment_id=? AND alarmed_id=?";
    conn.query(sql, [post.comment_id, post.alarmed_id], function (error, results, field) {
        if (error) {
            throw error;
        }
        response.redirect('/board/' + post.board_id + '/0/' + post.post_id + '?commentId=' + post.comment_id);
    });
});

router.post('/alarm/delete_process', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE alarm SET isCheck=1 WHERE comment_id=? AND alarmed_id=?";
    conn.query(sql, [post.comment_id, post.alarmed_id], function (error, results, field) {
        if (error) {
            throw error;
        }
        response.redirect('/my_info/alarm/' + post.this_page);
    });
});

router.get('/mypost/:this_page', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var post_writer = request.user.id;
    var sql = 'SELECT * FROM post WHERE post_writer=? AND isDelete=0';
    var login = auth.statusUI(request, response);
    conn.query(sql, [post_writer], function (error, results) {
        if (error) {
            throw error;
        }
        var content = ``;
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        if (results[0]) {
            var total_page = parseInt((results.length - 1) / 10) + 1;
            if (this_page > total_page) {
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">` + template.postlist_mypost(results, this_page) + template.pagination_mypost(this_page, total_page) + `</div>`;
        }
        else {
            content = `
                <div id="content">
                    게시글이 존재하지 않습니다.
                </div>`;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.get('/mycomment/:this_page', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var comment_writer = request.user.id;
    var sql = 'SELECT * FROM comment WHERE comment_writer=? AND isDelete=0';
    var login = auth.statusUI(request, response);
    conn.query(sql, [comment_writer], function (error, results) {
        if (error) {
            throw error;
        }
        var content = ``;
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        if (results[0]) {
            var total_page = parseInt((results.length - 1) / 10) + 1;
            if (this_page > total_page) {
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">
                    ` + template.postlist_mycomment(results, this_page) + template.pagination_mycomment(this_page, total_page) + `</div>`;
        }
        else {
            content = `
                <div id="content">
                    댓글이 존재하지 않습니다.
                </div>`;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/register_process', function (request, response) {
    var post = request.body;
    var salt = '';
    var hashingPwd = '';
    crypto.randomBytes(64, (err, buf) => {
        if (err) throw err;
        salt = buf.toString('hex');

        // hashing
        crypto.pbkdf2(post.auth_pwd, salt, 112311, 64, 'sha512', (err, derivedKey) => {
            if (err) throw err;
            hashingPwd = derivedKey.toString('hex');

            // sql insert
            var insert_sql = 'INSERT INTO user_info (id, salt, pwd, name, birth, email) VALUES (?,?,?,?,?,?);';
            conn.query(insert_sql, [post.auth_id, salt, hashingPwd, post.auth_name, post.auth_birth, post.auth_email], function (error, users) {
                if (error) {
                    throw error;
                }
                response.redirect('/auth/login');
            })
        });
    });
});

router.post('/checkId', urlencodedParser, function (request, response) { // 회원가입때랑 정보수정때 사용
    var checkingId = request.body.id;
    var success_sql = 'SELECT EXISTS(SELECT * FROM user_info WHERE id =?) AS SUCCESS';
    conn.query(success_sql, [checkingId], function (error, results) {
        if (error) {
            throw error;
        }

        if (request.session.passport && request.session.passport.user === checkingId) { // 로그인 되어있는 경우 and 아이디가 같은 경우
            response.send({ msg: '현재 아이디입니다.', value: true, isIdChange: true });
        } else if (results[0].SUCCESS) {
            response.send({ msg: '이미 사용중인 아이디입니다.', value: false, isIdChange: false });
        } else {
            response.send({ msg: '사용 가능한 아이디입니다.', value: true, isIdChange: false });
        }
    });
});

// 비밀번호 재입력 아마 사용 안할 듯
router.post('/pwd_auth', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var post = request.body;
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
        </nav>`;
    var content = template.pwd_auth(post);
    var html = template.basic(title, login, nav, content);
    response.send(html);
});
module.exports = router;