var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var template = require('../lib/template.js');

// mysql connection
var conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'mintchoco',
    database : 'community'
});
conn.connect();

router.get('/login', function (request, response) {
    var title = ``;
    var nav = ``;
    var login = `<form action="/auth/login">
    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
    type="submit" id="login">로그인</button>
    </form>`;

    var content = `<form action="/auth/login_process" method="POST">
        <p>아이디 : <input type="text" name="id" placeholer="아이디를 입력해주세요."></p>
        <p>비밀번호 : <input type="password" name="pwd" placeholer="비밀번호를 입력해주세요."></p>
        <p><input type="submit" value="로그인"></p>
        </form>`;

    var html = template.basic(title, login, nav, content);
    response.send(html);
});

/* passport 관련 부분. 나중에 더 알아봐야 함
router.post('/login_process', passport.authenticate('local', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});
*/

router.post('/login_process', function (request, response) {
    var post = request.body;
    var id = post.id;
    var password = post.pwd;

    // salt, hash 부분 table에 추가해야 할 수도 있음
    var sql = 'SELECT pwd FROM user_info WHERE id=?';
    conn.query(sql,[id], function (error, results, field) {
        if (error) {
            throw error;
        }
        if (results.length) {
            console.log("There is no such id.");
            response.redirect('/');
        }
        else {
            if (password === results.pwd) {
                request.session.is_logined = true;
                request.session.id = id;
                request.session.save(function () {
                    response.redirect(`/`);
                });
            } else {
                response.send('Who?');
            }
            // response.redirect(`/topic/${title}`);

            /* bcrypt 관련 더 알아보고 마저 수정해야 함
            bcrypt.compare(req.body.password, results.password, function (err, result) {
                if (result) {
                    res.redirect('/');
                } else {
                    res.send('Incorrect password');
                    res.redirect('/');
                }
            });
            */
        }
    });


});

module.exports = router;
/*
// print out post list
router.get('/board/:boardId', function(req, res){
    // login
    if(!isLogin){
        res.redirect('/');
    }
    else{
        var boardId = sanitizeHtml(req.params.boardId);
        var sql = 'SELECT * FROM post WHERE board_id=' + boardId;
        if(boardId != 0 && boardId != 1 && boardId != 2){
            wrongPath = true;
            res.redirect('/');
        }
        else{
            var login = `<form action="">
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="login">로그아웃</button>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="login">내 정보</button>
            </form>`;
            conn.query(sql, function(error, results, field){
                if(error){
                    throw error;
                }
                var content = ``;
                var title = ``;
                var alert = ``;
                var nav = `<h2>게시판</h2>
                <p id="side-list"><a href="/board/0">공지사항</a></p>
                <p id="side-list"><a href="/board/1">자유게시판</a></p>
                <p id="side-list"><a href="/board/2">익명게시판</a></p>`;
                if(results[0] === undefined){
                    content = '게시글이 존재하지 않습니다.';
                }
                else{
                    var content = template.postlist(results);
                }
                var html = template.HTML(title, login, nav, content, alert);
                res.send(html);
            });
        }
    }
});
*/
