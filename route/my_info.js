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
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var login = auth.statusUI(request, response);
    var sql = "SELECT id, email, name, birth, report_cnt FROM user_info WHERE id=?";
    conn.query(sql, [request.user.id], function (error, results, field) {
        if (error) {
            throw error;
        }
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        var content = template.myinfo(results);
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/update', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var post = request.body;
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
        </nav>`;
    var content = template.update(post);
    var html = template.basic(title, login, nav, content);
    response.send(html);
});

router.post('/update_process', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var post = request.body;
    console.log(post);
    var sql = `INSERT INTO user_info VALUES (?, ?, 'myname', ?,'myemail@gmail.com', 0, 0);`
    conn.
        conn.query(sql, [post.auth_id, post.auth_pwd, post.auth_birth, post.auth_email,], function (error, results, field) {
            if (error) {
                throw error;
            }
            // 건우오빠가 해오면 됩니다.
            // var title = ``;
            // var nav = `<nav>
            //     <h2>정보 관리</h2>
            //     <p id="side-list"><a href="/my_info">내 정보</a></p>
            //     <p id="side-list"><a href="/my_info/0">알림</a></p>
            //     <p id="side-list"><a href="/my_info/1">내가 쓴 글</a></p>
            //     <p id="side-list"><a href="/my_info/2">내가 쓴 댓글</a></p>
            //     </nav>`;
            // var content = template.myinfo(results);
            // var html = template.basic(title, login, nav, content);
            // response.send(html);
            console.log(sql);
        });
});

router.get('/alarm/:this_page', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>정보 관리</h2>
        <p id="side-list"><a href="/my_info">내 정보</a></p>
        <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
        <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
        <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
        </nav>`;
    var content = ``;
    var sql = 'SELECT * FROM alarm WHERE alarmed_id=? AND isCheck=0 AND alarmed_id != alarming_id';
    conn.query(sql, [request.user.id], function(error, results){
        if(error){
            console.log(error);
            throw error;
        }
        if(!results[0]){
            content=`<div id="content">알림이 없습니다.</div>`;
        }
        else{  
            var total_page = parseInt((results.length-1)/10) + 1;
            if (this_page > total_page){
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = template.alarmlist(results, this_page);
            content += template.pagination_alarmlist(this_page, total_page);
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });    
});

router.post('/alarm/view_process',function(request,response){
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE alarm SET isCheck=1 WHERE comment_id=? AND alarmed_id=?";
    conn.query(sql, [post.comment_id, post.alarmed_id], function(error, results, field){
        if (error) {
            throw error;
        }
        response.redirect('/board/'+post.board_id+'/0/'+post.post_id);
    });
});

router.post('/alarm/delete_process',function(request,response){
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE alarm SET isCheck=1 WHERE comment_id=? AND alarmed_id=?";
    conn.query(sql, [post.comment_id, post.alarmed_id], function(error, results, field){
        if (error) {
            throw error;
        }
        response.redirect('/my_info/alarm/'+post.this_page);
    });
});

router.get('/mypost/:this_page', function (request, response){
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var post_writer = request.user.id;
    var sql = 'SELECT * FROM post WHERE post_writer=?';
    var login = auth.statusUI(request, response);
    conn.query(sql, [post_writer], function (error, results) {
        if (error) {
            throw error;
        }
        var content = ``;
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        if (results[0]) {
            var total_page = parseInt((results.length-1)/10) + 1;
            if (this_page > total_page){
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">` + template.postlist_mypost(results, this_page) + template.pagination_mypost(this_page, total_page) + `</div>`;
        }
        else {
            content = `
                <div id="content">
                    게시글이 존재하지 않습니다.
                </div>`;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.get('/mycomment/:this_page', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var this_page = sanitizeHtml(request.params.this_page);
    this_page = Number(this_page);
    var comment_writer = request.user.id;
    var sql = 'SELECT * FROM comment WHERE comment_writer=?';
    var login = auth.statusUI(request, response);
    conn.query(sql, [comment_writer], function (error, results) {
        if (error) {
            throw error;
        }
        var content = ``;
        var title = ``;
        var nav = `<nav>
            <h2>정보 관리</h2>
            <p id="side-list"><a href="/my_info">내 정보</a></p>
            <p id="side-list"><a href="/my_info/alarm/1">알림</a></p>
            <p id="side-list"><a href="/my_info/mypost/1">내가 쓴 글</a></p>
            <p id="side-list"><a href="/my_info/mycomment/1">내가 쓴 댓글</a></p>
            </nav>`;
        if (results[0]) {
            var total_page = parseInt((results.length-1)/10) + 1;
            if (this_page > total_page){
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = `
                <div id="content">
                    ` + template.postlist_mycomment(results, this_page) + template.pagination_mycomment(this_page, total_page) + `</div>`;
        }
        else {
            content = `
                <div id="content">
                    댓글이 존재하지 않습니다.
                </div>`;
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

module.exports = router;