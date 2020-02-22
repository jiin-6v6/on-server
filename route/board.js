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
            <p id="side-list"><a href="/board/0">공지사항</a></p>
            <p id="side-list"><a href="/board/1">자유게시판</a></p>
            <p id="side-list"><a href="/board/2">익명게시판</a></p>
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
    var content = post.post_content;

    if (boardId != 0 && boardId != 1 && boardId != 2) {
        // category 지정 안됐을 때도 여기로 오는데 이거 alert로 처리하고 싶어요
        wrongPath = true;
        response.redirect('/');
        return false;
    }
    var sql = 'INSERT INTO post (post_writer, content, board_id, post_title) VALUES (?, ?, ?, ?)'
    conn.query(sql, [request.user.id, content, boardId, post_title], function (error, results) {
        if (error) {
            throw error;
        }

        var sql = 'SELECT id FROM post WHERE post_writer=? AND content=? AND board_id=? AND post_title=? ORDER BY time DESC';
        conn.query(sql, [request.user.id, content, boardId, post_title], function (error2, results2) {
            if (error2) {
                throw error2;
            }
            if (!results2[0]) {
                console.log('왜 결과가 없냐? INSERT 일 안하냐?');
                response.redirect('/');
                return false;
            }
            else {
                var postId = results2[0].id;
                response.redirect('/board/' + boardId + '/' + postId);
            }
        });
    });
});

// print out post list
router.get('/:boardId', function (request, response) {
    // 기조가 할 일
    // pagination 사용해서 예쁘게 나오게 해야함(lib/tenplate.js 참고)
    // 알아서 정현언니랑 토의해보셔요
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var sql = 'SELECT * FROM post WHERE board_id=' + boardId;
    if (boardId != 0 && boardId != 1 && boardId != 2) {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var login = auth.statusUI(request, response);
    conn.query(sql, function (error, results) {
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
        if (results[0]) {
            content = `
                <div id="content">
                    <div id=board_write>
                        <form action="/board/write">
                            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_write">글쓰기</button>
                        </form>
                    </div>` + template.postlist(results, boardId) + `</div>`;
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

router.get('/:boardId/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);

    if (boardId != 0 && boardId != 1 && boardId != 2) {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var title = '';
    var nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/0">공지사항</a></p>
        <p id="side-list"><a href="/board/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/2">익명게시판</a></p>
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

        var category = '';
        var post_writer = '';
        if (boardId == 2) {
            category = '익명게시판';
            post_writer = '익명';
        }

        var button = ``;
        if (results[0].post_writer === request.user.id) {
            button = `<div id="post_modify" style="text-align: right;">
                <form action="" method="POST">
                    <input type="submit" id="post_rewrite" value="수정하기" formaction="/board/update/${boardId}/${postId}">
                    <input type="submit" id="post_delete" value="삭제하기" formaction="/board/delete/${boardId}/${postId}">
                </form>
                </div>`;
        }
        else{   // 새창 띄우기를 하고 싶은건데 아직 어떻게 하는건지 모르겠음!
            button = `<div id="report" style="text-align: right;">
            <form action="" method="POST">
                <input type="submit" id="post_rewrite" value="신고하기">
            </form>
            </div>`;
        }
        if(request.user.isAdmin){
            button = `<div id="post_modify" style="text-align: right;">
            <form action="" method="POST">
                <input type="submit" id="post_delete" value="삭제하기" formaction="/board/delete/${boardId}/${postId}">
            </form>
            </div>`;
        }

        var post_content = results[0].content.replace(/\r\n/gi, "<br>");

        var content = `<div id="content">
                <div id="post_content">
                <div id="post_header">
                    <div id="post_title">
                        ${category} | ${results[0].post_title}
                    </div>
                    <div id="post_time" style="text-align: right;">
                        ${results[0].time}
                    </div>
                    <div id="post_write" style="text-align: right;">
                        ${post_writer}
                    </div>
                </div>
                <hr class = 'one'></hr>
                ${button}
                <div id="post_content">
                    <p>${post_content}</p>
                </div>
                <div id="comments">
                    <input type="textarea" id="comment_content" style="width: 600px; height: 70px;">
                    <input type="submit" id="comment" value="댓글달기">
                    <p>댓글 내용</p>
                </div>
                </div>
            </div>`

        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/update/:boardId/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);

    if (boardId != 0 && boardId != 1 && boardId != 2) {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?'
    conn.query(sql, [boardId, postId], function (error, results, field) {
        if (error) {
            throw error;
        }

        var title = '';
        var login = auth.statusUI(request, response);
        var nav = `<nav>
            <h2>게시판</h2>
            <p id="side-list"><a href="/board/0">공지사항</a></p>
            <p id="side-list"><a href="/board/1">자유게시판</a></p>
            <p id="side-list"><a href="/board/2">익명게시판</a></p>
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

    var postId = sanitizeHtml(request.params.postId);

    var post = request.body;
    var boardId = post.category;
    var post_title = post.post_title;
    var content = post.post_content;

    if (boardId != 0 && boardId != 1 && boardId != 2) {
        // category 지정 안됐을 때도 여기로 오는데 이거 alert로 처리하고 싶어요
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?'
    conn.query(sql, [boardId, postId], function (error, results, field) {
        if (error) {
            throw error;
        }
        if (!results[0]) {  // 존재하지 않는 게시글
            wrongPath = true;
            response.redirect('/board/' + boardId + '/' + postId);
            return false;
        }
        if (results[0].post_writer !== request.user.id) { // 작성자가 아닌 경우
            response.redirect('/board/' + boardId + '/' + postId);
            return false;
        }
        var sql = 'UPDATE post SET post_title=?, content=?, board_id=? WHERE id=?';
        conn.query(sql, [post_title, content, boardId, postId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                response.status(500).send('Internal Server Error');
            }
            else {
                response.redirect('/board/' + boardId + '/' + postId);
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

    if (boardId != 0 && boardId != 1 && boardId != 2) {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?'
    conn.query(sql, [boardId, postId], function (error, results, field) {
        if (error) {
            throw error;
        }
        if (!results[0]) {  // 존재하지 않는 게시글
            wrongPath = true;
            response.redirect('/board/' + boardId + '/' + postId);
            return false;
        }
        if (results[0].post_writer !== request.user.id) { // 작성자가 아닌 경우
            response.redirect('/board/' + boardId + '/' + postId);
            return false;
        }
        // 지인 : 조건 충족하므로 삭제하는 과정 추가하면 됨
    });
});
module.exports = router;