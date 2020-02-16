var express = require('express');
var router = express.Router();
var qs = require('querystring');
var mysql = require('mysql');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

// mysql connection
var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'mintchoco',
    database : 'community'
});
conn.connect();

router.get('/write', function (request, response){
    if (!auth.isOwner(request, response)) {
        response.redirect('/');
    }
    else{
        var title = '';
        var login = auth.statusUI(request, response);
        var nav = `<nav>
            <h2>게시판</h2>
            <p id="side-list"><a href="/board/0">공지사항</a></p>
            <p id="side-list"><a href="/board/1">자유게시판</a></p>
            <p id="side-list"><a href="/board/2">익명게시판</a></p>
            </nav>`;
        var content = `
            <div id="content">
            <form action="" method="POST">
            <select name="category">
            <option value="">카테고리 선택</option>
            <option value="free">자유게시판</option>
            <option value="anonymous">익명게시판</option>
            </select>
            <input type="text" id="post_title" placeholder="제목을 입력하세요.">
            <br><br>
            <textarea id="post_content" placeholder="내용을 입력하세요."></textarea>
            <br><br>
            <input type="file" id="post_file">
            <br>
            <input type="submit" id="to_post" style="position: absolute; right: 130px;">
            </form>
            </div>`;
        var html = template.basic(title, login, nav, content);
        response.send(html);
    }
});

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
                content = `
                    <div id="content">
                    <div id=board_write>
                    <form action="/board/write">
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                    type="submit" id="btn_write">글쓰기</button>
                    </form>
                    </div>
                    게시글이 존재하지 않습니다.
                    </div>`;
            }
            else {
                content = `
                <div id="content">
                <div id=board_write>
                <form action="/board/write">
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                type="submit" id="btn_write">글쓰기</button>
                </form>
                </div>` + template.postlist(results, boardId) + `</div>`;
            }
            var html = template.basic(title, login, nav, content);
            response.send(html);
        });
    }
});
router.get('/:boardId/:postId', function (request, response) {
    if (!auth.isOwner(request, response)) {
        response.redirect('/');
    }
    else {
        var boardId = sanitizeHtml(request.params.boardId);
        var postId = sanitizeHtml(request.params.postId);
    }
});
module.exports = router;