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
                    var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?, ?)';
                    conn.query(sql, [boardId, postId, comment_writer, comment_content, unknown], function (error3, results3) {
                        if (error3) {
                            console.log(error3);
                            throw error3;
                        }
                    });
                });
            }
            else {  // 이미 익명번호를 부여 받은 경우
                var unknown = results[0].unknown;
                var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?, ?)';
                conn.query(sql, [boardId, postId, comment_writer, comment_content, unknown], function (error3, results3) {
                    if (error3) {
                        console.log(error3);
                        throw error3;
                    }
                });
            }
        });
    }
    else {
        var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content) VALUES (?, ?, ?, ?)';
        conn.query(sql, [boardId, postId, comment_writer, comment_content], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
        });
    }
    // select 해서  comment_id 얻어야 함
    // 알람에 insert 처리 해야함
    response.redirect('/board/' + boardId + '/0/' + postId);
});

router.get('/update/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);
    var commentId = Number(sanitizeHtml(request.params.commentId));

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var title = '';
    var nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
        </nav>`;
    var login = auth.statusUI(request, response);

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?';
    conn.query(sql, [boardId, postId], function (error, results) {
        if (error) {
            throw error;
        }

        if (!results[0]) {
            wrongPath = true;
            response.redirect('/board/' + boardId);
            return false;
        }

        var content = template.look_post(request, results);       

        var sql = 'SELECT * FROM comment WHERE post_id=? ORDER BY time DESC';
        conn.query(sql, [postId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                throw error2;
            }
            content += template.comment_list_update(request, results2, boardId, postId, commentId);

            var html = template.basic(title, login, nav, content);
            response.send(html);
        });
    });
});

router.post('/update_process/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = Number(sanitizeHtml(request.params.postId));
    var commentId = Number(sanitizeHtml(request.params.commentId));

    var post = request.body;
    var comment_content = post.comment_content;

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM comment WHERE id=?';
    conn.query(sql, [commentId], function (error, results) {
        if (error) {
            throw error;
        }
        if (!results[0]) {  // 존재하지 않는 댓글
            wrongPath = true;
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }
        if (results[0].comment_writer !== request.user.id) { // 작성자가 아닌 경우
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }
        if(results[0].post_id !== postId){  // db에 저장되어 있는 댓글의 게시글 위치와 다른 경우
            console.log('something wrong!');
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }
        
        var sql = 'UPDATE comment SET comment_content=?, isUpdate=1 WHERE id=?';
        conn.query(sql, [comment_content, commentId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                response.status(500).send('Internal Server Error');
            }
            else {
                response.redirect('/board/' + boardId + '/0/' + postId);
            }
        });
    });
});

router.get('/delete/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);
    var commentId = sanitizeHtml(request.params.commentId);

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM comment WHERE id=?';
    conn.query(sql, [commentId], function(error, results){
        if (error) {
            console.log(error);
            throw error;
        }
        if (!results[0]) {    // 존재하지 않는 댓글을 지우려고 했을 때
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false
        }
        if (request.user.isAdmin) { // admin mode
            var sql = 'UPDATE user_info SET report_cnt = report_cnt + 1 WHERE id=?';
            conn.query(sql, [results[0].comment_writer], function (error2, results2) {
                if (error2) {
                    console.log(error2);
                    response.status(500).send('Internal Server Error');
                }
                else {       // report page num 어떻게 넘길 것인가..
                    // response.redirect('/admin/1');
                }
            });
            var sql = 'UPDATE report SET state=1 WHERE comment_id=? AND post_id=?';
            conn.query(sql, [commentId, postId], function (error3, results3) {
                if (error3) {
                    console.log(error3);
                    response.status(500).send('Internal Server Error');
                }
                else {
                    // 지인아 여기는 뭘까?
                }
            });
        }
        if ((request.user.id !== results[0].comment_writer) && !request.user.isAdmin) {    // 작성자도 아니고 관리자도 아닌 경우
            console.log('something wrong');
            response.redirect('/');
            return false;
        }
        var sql = 'DELETE FROM comment WHERE id=?';
        conn.query(sql, [commentId], function (error4, results4) {
            if (error4) {
                console.log(error4);
                throw error4;
            }
            else {
                if (request.user.isAdmin) {   // report page number 어떻게 처리할 것인가..
                    response.redirect('/admin/1');
                    return true;
                }
                response.redirect('/board/' + boardId + '/0/' + postId);
            }
        });
    });
});
module.exports = router;