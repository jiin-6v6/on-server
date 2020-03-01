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

router.get('/write', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var title = '';
    var login = auth.statusUI(request, response);
    var nav = `<nav>
                <h2>게시판</h2>
                <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
                <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
                <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
                </nav>`;
    var content = template.post_write_update(request, response, null, null);
    if (!content) {   // 조건에 걸려서 content==false인 경우
        response.redirect('/');
        return false;
    }
    var html = template.basic(title, login, nav, content);
    response.send(html);
});

router.post('/write_process', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var post = request.body;
    var boardId = post.category;
    var post_title = post.post_title;
    var post_content = post.post_content;

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        // category 지정 안됐을 때도 여기로 오는데 이거 alert로 처리하고 싶어요
        wrongPath = true;
        response.redirect('/');
        return false;
    }
    var sql = 'INSERT INTO post (post_writer, post_content, board_id, post_title) VALUES (?, ?, ?, ?)'
    conn.query(sql, [request.user.id, post_content, boardId, post_title], function (error, results) {
        if (error) {
            throw error;
        }

        var sql = 'SELECT id FROM post WHERE post_writer=? AND post_content=? AND board_id=? AND post_title=? ORDER BY time DESC';
        conn.query(sql, [request.user.id, post_content, boardId, post_title], function (error2, results2) {
            if (error2) {
                throw error2;
            }
            if (!results2[0]) {
                response.redirect('/');
                return false;
            }
            else {
                var postId = results2[0].id;
                response.redirect('/board/' + boardId + '/1');
            }
        });
    });
});

// print out post list
router.get('/:boardId/:this_page', function (request, response) {
    // 기조가 할 일
    // pagination 사용해서 예쁘게 나오게 해야함(lib/tenplate.js 참고)
    // 알아서 정현언니랑 토의해보셔요
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var sql = 'SELECT * FROM post WHERE board_id=?';
    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }
    var login = auth.statusUI(request, response);
    conn.query(sql, [boardId], function (error, results) {
        if (error) {
            throw error;
        }
        var content = ``;
        var title = ``;
        var nav = `<nav>
                <h2>게시판</h2>
                <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
                <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
                <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
                </nav>`;
        if (results[0] && boardId != 'anonymous') {
            var total_page = parseInt((results.length - 1) / 10) + 1;
            if (this_page > total_page) {
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">
                    <div id=board_write>
                        <form action="/board/write">
                            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_write">글쓰기</button>
                        </form>
                    </div>` + template.postlist(results, boardId, this_page) + template.pagination_board(boardId, this_page, total_page) + `</div>`;
        }
        else if (results[0] && boardId == 'anonymous') {
            var total_page = parseInt((results.length - 1) / 10) + 1;
            if (this_page > total_page) {
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">
                    <div id=board_write>
                        <form action="/board/write">
                            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_write">글쓰기</button>
                        </form>
                    </div>` + template.postlist_anony(results, boardId, this_page) + template.pagination_board(boardId, this_page, total_page) + `</div>`;
        }
        else {
            content = `
                <div id="content">
                    <div id=board_write>
                        <form action="/board/write">
                            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_write">글쓰기</button>
                        </form>
                    </div>
                    게시글이 존재하지 않습니다.
                </div>`;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.get('/:boardId/0/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = Number(sanitizeHtml(request.params.postId));

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

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?'
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
            content += template.comment_list_update(request, results2, boardId, postId, null);

            var html = template.basic(title, login, nav, content);
            response.send(html);
        });
    });
});

router.post('/update/:boardId/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var boardId = sanitizeHtml(request.params.boardId);
    var postId = Number(sanitizeHtml(request.params.postId));

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?'
    conn.query(sql, [boardId, postId], function (error, results) {
        if (error) {
            throw error;
        }

        var title = '';
        var login = auth.statusUI(request, response);
        var nav = `<nav>
                <h2>게시판</h2>
                <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
                <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
                <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
                </nav>`;

        var content = template.post_write_update(request, response, postId, results);
        if (!content) {   // 조건에 걸려서 content==false인 경우
            response.redirect('/board/' + boardId + '/' + postId);
            return false;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/update_process/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var postId = Number(sanitizeHtml(request.params.postId));

    var post = request.body;
    var boardId = post.category;
    var post_title = post.post_title;
    var content = post.post_content;

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        // category 지정 안됐을 때도 여기로 오는데 이거 alert로 처리하고 싶어요
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE id=?';
    conn.query(sql, [postId], function (error, results) {
        if (error) {
            throw error;
        }
        if (!results[0]) {  // 존재하지 않는 게시글
            wrongPath = true;
            response.redirect('/board/' + boardId + '/1');
            return false;
        }
        if (results[0].post_writer !== request.user.id) { // 작성자가 아닌 경우
            response.redirect('/board/' + boardId + '/1');
            return false;
        }
        var sql = 'UPDATE post SET post_title=?, post_content=?, board_id=?, time=CURRENT_TIMESTAMP, isUpdate=1 WHERE id=?';
        conn.query(sql, [post_title, content, boardId, postId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                response.status(500).send('Internal Server Error');
            }
            else {
                var sql = 'UPDATE comment SET board_id=? WHERE post_id=?';
                conn.query(sql, [boardId, postId], function(error3, results3){
                    if(error3){
                        console.log(error3);
                        response.status(500).send('Internal Server Error');
                    }
                })
                response.redirect('/board/' + boardId + '/1');
            }
        });
    });
});


router.post('/delete/:boardId/:postId', function (request, response) {
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

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?';
    conn.query(sql, [boardId, postId], function (error, results) {
        if (error) {
            console.log(error);
            throw error;
        }
        if (!results[0]) {    // 존재하지 않는 게시글을 지우려고 했을 때
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false
        }
        if (request.user.isAdmin) { // admin mode
            var sql = 'UPDATE user_info SET report_cnt = report_cnt + 1 WHERE id=?';
            conn.query(sql, [results[0].post_writer], function (error2, results2) {
                if (error2) {
                    console.log(error2);
                    response.status(500).send('Internal Server Error');
                }
                else {       // report page num 어떻게 넘길 것인가..
                    // response.redirect('/admin/1');
                }
            });
            var sql = 'UPDATE report SET state=1 WHERE comment_id=0 AND post_id=?';
            conn.query(sql, [postId], function (error3, results3) {
                if (error3) {
                    console.log(error3);
                    response.status(500).send('Internal Server Error');
                }
                else {
                    // ???
                }
            });
        }
        if ((request.user.id !== results[0].post_writer) && !request.user.isAdmin) {    // 작성자도 아니고 관리자도 아닌 경우
            if (!request.user.isAdmin) {
                console.log('something wrong');
                response.redirect('/');
                return false;
            }
        }
        var sql = 'DELETE FROM post WHERE id=?';
        conn.query(sql, [postId], function (error4, results4) {
            if (error4) {
                console.log(error4);
                throw error4;
            }
            else {
                if (request.user.isAdmin) {   // report page number 어떻게 처리할 것인가..
                    response.redirect('/admin/1');
                    return true;
                }
                response.redirect('/board/' + boardId + '/1');
            }
        });
    });
});

// comment 처리 하는 과정
// router.post('/comment_process', function (request, response) {
//     if (!auth.isLogin(request, response)) {
//         response.redirect('/');
//         return false;
//     }

//     var post = request.body;
//     var postId = post.post_id;
//     var commentWriter = post.comment_writer;
//     var boardId = post.board_id;
//     var content = post.comment_content;

//     if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
//         // category 지정 안됐을 때도 여기로 오는데 이거 alert로 처리하고 싶어요
//         wrongPath = true;
//         response.redirect('/');
//         return false;
//     }
//     var sql = 'INSERT INTO comment (post_id, comment_writer, unknown, content) VALUES (?, ?, ?, ?)';
//     conn.query(sql, [postId, commentWriter, boardId, content], function (error, results) {
//         if (error) {
//             throw error;
//         }

//         var sql = 'SELECT id FROM comment WHERE post_id=? AND comment_writer=? AND unknown=? AND content=? ORDER BY time DESC';
//         conn.query(sql, [postId, commentWriter, boardId, content], function (error2, results2) {
//             if (error2) {
//                 throw error2;
//             }
//             if (!results2[0]) {
//                 console.log('왜 결과가 없냐? INSERT 일 안하냐?');
//                 response.redirect('/');
//                 return false;
//             }
//             else {
//                 response.redirect('/board/' + boardId + '/1');
//             }
//         });
//     });
// });
module.exports = router;