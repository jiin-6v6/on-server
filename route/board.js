var express = require('express');
var router = express.Router();
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var mysql = require('mysql');
var auth = require('../lib/auth.js');

// mysql connection
var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'mintchoco',
    database : 'community'
});
conn.connect();

// print out post list
router.get('/:boardId', function (request, response) {
    if (!auth.isOwner(request, response)) {
        response.redirect('/');
    }
    else {
        var boardId = sanitizeHtml(request.params.boardId);
        var sql = 'SELECT * FROM post WHERE board_id=' + boardId;
        if (boardId != 0 && boardId != 1 && boardId != 2) {
            wrongPath = true;
            response.redirect('/');
            return false;
        }
        var login = auth.statusUI(request, response);
        conn.query(sql, function (error, results, field) {
            if (error) {
                throw error;
            }
            var content = ``;
            var title = ``;
            var nav = `<nav>
                <h2>게시판</h2>
                <p id="side-list"><a href="/board/0">공지사항</a></p>
                <p id="side-list"><a href="/board/1">자유게시판</a></p>
                <p id="side-list"><a href="/board/2">익명게시판</a></p>
                </nav>`;
            if (results[0] === undefined) {
                content = '게시글이 존재하지 않습니다.';
            }
            else {
                var content = template.postlist(results);
            }
            var html = template.basic(title, login, nav, content);
            response.send(html);
        });
    }
});

module.exports = router;