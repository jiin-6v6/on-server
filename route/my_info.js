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
    var login = auth.statusUI(request, response);
    var sql = "SELECT id, email, name, birth FROM user_info WHERE id=?";
    conn.query(sql, [request.user], function (error, results, field) {
        if (error) {
            throw error;
        }
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/0">알림</a></p>
            <p id="side-list"><a href="/my_info/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/2">내가 쓴 댓글</a></p>
            </nav>`;
        var content = template.myinfo(results);
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/update', function (request, response){
    var post = request.body;
    console.log(post);
    //건우오빠가 여기를 채워오면 됩니다.
});

module.exports = router;