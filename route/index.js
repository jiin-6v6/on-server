var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var template = require('../lib/template.js');
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
    var select_sql = 'SELECT * FROM sessions';
    var delete_sql = 'DELETE FROM sessions WHERE session_id=?'
    conn.query(select_sql, function (error, results) {
        if (error) {
            throw error;
        }
        for (var i = 0; i < results.length; i++) {
            if (new Date(JSON.parse(results[i].data).cookie.expires).getTime() < Date.now()) {
                conn.query(delete_sql, [results[i].session_id], function (error2, results2) {
                    if (error2) {
                        throw error2;
                    }
                });
            }
        }
    });
    var title = ``;
    if (!auth.isLogin(request, response)) {
        nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">익명게시판</a></p>
        </nav>`;
    }
    else {
        nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
        </nav>`;
    }
    var content = `<div id="content"><img src="/icebear.png" width=500px></div>`;
    if (request.cookies.once_logined == false) {
        content += `<script type="text/javascript">alert("세션이 만료되어 다시 로그인 해주세요");</script>`
    }
    var login = auth.statusUI(request, response);
    html = template.basic(title, login, nav, content);
    response.send(html);
});

module.exports = router;