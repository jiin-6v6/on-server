var express = require('express');
var router = express.Router();
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var mysql = require('mysql');
var auth = require('../lib/auth.js');

// mysql connection
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mintchoco',
    database: 'community',
    dateStrings: 'date'
});
conn.connect();

router.get('/', function (request, response) {
    if(!auth.isLogin){
        response.redirect('/');
        return false;
    }

    var login = auth.statusUI(request, response);
    var sql = "SELECT id, email, name, birth FROM user_info WHERE id=?";
    conn.query(sql, [request.user.id], function (error, results, field) {
        if (error) {
            throw error;
        }
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment">내가 쓴 댓글</a></p>
            </nav>`;
        var content = template.myinfo(results);
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/update', function (request, response){
    var post = request.body;
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment">내가 쓴 댓글</a></p>
        </nav>`;
    var content = template.update(post);
    var html = template.basic(title, login, nav, content);
    response.send(html);
});

router.post('/update_process', function(request, response){
    var post = request.body;
    console.log(post);
    var sql = `INSERT INTO user_info VALUES (?, ?, 'myname', ?,'myemail@gmail.com', 0, 0);`
    conn.
    conn.query(sql, [post.auth_id, post.auth_pwd, post.auth_birth, post.auth_email, ], function (error, results, field) {
        if (error) {
            throw error;
        }
        // 건우오빠가 해오면 됩니다.
        // var title = ``;
        // var nav = `<nav>
        //     <h2>정보 관리</h2>
        //     <p id="side-list"><a href="/my_info">내 정보</a></p>
        //     <p id="side-list"><a href="/my_info/0">알림</a></p>
        //     <p id="side-list"><a href="/my_info/1">내가 쓴 글</a></p>
        //     <p id="side-list"><a href="/my_info/2">내가 쓴 댓글</a></p>
        //     </nav>`;
        // var content = template.myinfo(results);
        // var html = template.basic(title, login, nav, content);
        // response.send(html);
        console.log(sql);
    });
});

router.get('/alarm', function(request, response){
    // 기조가 할 일
});
router.get('/mypost', function (request, response){
    // 가조가 할 일
});
router.get('/mycomment', function (request, response){
    // 가조가 할 일
});

module.exports = router;