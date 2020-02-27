var express = require('express');
var router = express.Router();
var qs = require('querystring');
var mysql = require('mysql');
var sanitizeHtml = require('sanitize-html');
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

router.post('/:boardId/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);

    var post = request.body;
    var comment_writer = post.comment_writer;
    var comment_content = post.comment_content;

    if (request.user.id !== comment_writer) {
        response.redirect('/');
        return false;
    }

    if (boardId === 'anonymous') {
        var sql = 'SELECT unknown FROM comment WHERE comment_writer=? AND post_id=?';
        conn.query(sql, [comment_writer, postId], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
            if (!results[0]) {    // 한 번도 댓글을 단 적이 없을 때
                var sql = 'SELECT MAX(unknown) AS max FROM comment';
                conn.query(sql, function (error2, results2) {
                    if (error2) {
                        console.log(error2);
                        throw error2;
                    }
                    var unknown = (results2[0].max ? results2[0].max : 0) + 1;
                    var sql = 'INSERT INTO comment (post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?)';
                    conn.query(sql, [postId, comment_writer, comment_content, unknown], function (error3, results3) {
                        if (error3) {
                            console.log(error3);
                            throw error3;
                        }
                    });
                });
            }
            else {  // 이미 익명번호를 부여 받은 경우
                var unknown = results[0].unknown;
                var sql = 'INSERT INTO comment (post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?)';
                conn.query(sql, [postId, comment_writer, comment_content, unknown], function (error3, results3) {
                    if (error3) {
                        console.log(error3);
                        throw error3;
                    }
                });
            }
        });
    }
    else {
        var sql = 'INSERT INTO comment (post_id, comment_writer, comment_content) VALUES (?, ?, ?)';
        conn.query(sql, [postId, comment_writer, comment_content], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
        });
    }
    response.redirect('/board/' + boardId + '/0/' + postId);
});

module.exports = router;