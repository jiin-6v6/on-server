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

router.post('/add', function(request, response){
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var post = request.body;
    var boardId = post.boardId;
    var postId = post.postId;
    var commentId = post.commentId;
    var reporter_id = post.reporter_id;
    var report_content = post.report_content;
    var commentId = post.commentId;

    if(request.user.id !== reporter_id){    // 로그인한 아이디와 신고자 아이디가 불일치한 경우
        console.log('something wrong');
        response.redirect('/');
        return false;
    }
    // 댓글 신고
    var sql = 'SELECT comment_writer FROM comment WHERE id=?';
    var id = commentId;
    if(commentId === "0"){    // 게시글 신고
        sql = 'SELECT post_writer FROM post WHERE id=?';
        id = postId;
    }
    
    conn.query(sql, [id], function(error, results){
        if(error){
            console.log(error);
            throw error;
        }
        if(!results[0]){    // 게시글 or 댓글이 존재하지 않는 경우
            console.log('something wrong');
            response.redirect('/');
            return false;
        }
        var reported_id = '';
        if(commentId === "0"){      // 게시글 신고
            reported_id = results[0].post_writer;
        }
        else{                       // 댓글 신고
            reported_id = results[0].comment_writer;
        }
        var sql = 'INSERT INTO report (board_id, post_id, comment_id, reported_id, reporter_id, report_content) VALUES (?, ?, ?, ?, ?, ?)';
        conn.query(sql, [boardId, postId, commentId, reported_id, reporter_id, report_content], function(error2, results2){
            if(error2){
                console.log(error2);
                throw error2;
            }
        });
        response.send(`<script>
        self.close();
        </script>`);
    })
});

router.get('/:boardId/:postId/:commentId', function(request, response){     // 댓글을 신고한 경우
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = Number(sanitizeHtml(request.params.postId));
    var commentId = Number(sanitizeHtml(request.params.commentId));

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM comment WHERE id=?';
    conn.query(sql, [commentId], function(error, results){
        if (error) {
            throw error;
        }

        if (!results[0]) {  // 코멘트가 존재하지 않는 경우
            wrongPath = true;
            response.redirect('/board/' + boardId);
            return false;
        }

        var comment_writer = `댓글 작성자 : ${results[0].comment_writer}<br>`;
        if(boardId === 'anonymous'){
            comment_writer = '';
        }
        var html = `<div id=content>
            <form method="POST" action="/report/add"><br>
            신고 하려는 댓글 : ${results[0].comment_content}<br>
            ${comment_writer}
            신고 사유 : <textarea placeholder="신고 사유를 작성해 주세요." name="report_content" style="vertical-align:text-top; width:500px; height:200px;"></textarea>
            <input type="hidden" name="boardId" value="${boardId}">
            <input type="hidden" name="postId" value="${postId}">
            <input type="hidden" name="commentId" value="${commentId}">
            <input type="hidden" name="reporter_id" value="${request.user.id}">
            <div style="text-align:right;">
            <br><input type="submit" class="btn" id="btn_report" value="제출하기">
            </div>
            </form>
            </div>`;
        response.send(html);
    });
});

router.get('/:boardId/:postId', function(request, response){        // 게시글 신고한 경우
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE id=?';
    conn.query(sql, [postId], function(error, results){
        if (error) {
            throw error;
        }

        if (!results[0]) {
            wrongPath = true;
            response.redirect('/board/' + boardId);
            return false;
        }

        var post_writer = `게시글 작성자 : ${results[0].post_writer}<br>`;
        if(boardId === 'anonymous'){
            post_writer = '';
        }
        var html = `<div id=content>
            <form method="POST" action="/report/add"><br>
            신고 하려는 게시글 : ${results[0].post_title}<br>
            ${post_writer}
            신고 사유 : <textarea placeholder="신고 사유를 작성해 주세요." name="report_content" style="vertical-align:text-top; width:500px; height:200px;"></textarea>
            <input type="hidden" name="boardId" value="${boardId}">
            <input type="hidden" name="postId" value="${postId}">
            <input type="hidden" name="commentId" value="0">
            <input type="hidden" name="reporter_id" value="${request.user.id}">
            <div style="text-align:right;">
            <br><input type="submit" class="btn" id="btn_report" value="제출하기">
            </div>
            </form>
            </div>`;
        response.send(html);
    });
});

module.exports = router;