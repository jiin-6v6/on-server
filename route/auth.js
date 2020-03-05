var express = require('express');
var router = express.Router();
var passport = require('passport');
var crypto = require('crypto');
var session = require('express-session');
var localStrategy = require('passport-local').Strategy;
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
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

module.exports = function (passport) {
    router.get('/login', function (request, response) {
        var select_sql = 'SELECT * FROM sessions';
        var delete_sql = 'DELETE FROM sessions WHERE session_id=?'
        conn.query(select_sql, function (error, results) {
            if (error) {
                throw error;
            }
            for (var i = 0; i < results.length; i++){
                if (new Date(JSON.parse(results[i].data).cookie.expires).getTime() < Date.now()){
                    conn.query(delete_sql, [results[i].session_id], function (error2, results2) {
                        if (error2) {
                            throw error2;
                        }
                    });
                }
            }
        });
        if (auth.isLogin(request, response)) {
            response.redirect('/');
        }
        else {
            var flash_msg = request.flash();
            var feedback = ``;
            if (flash_msg.error) {
                feedback = flash_msg.error[0];
            }

            var title = ``;
            var nav = ``;
            var login = `<form action="/auth/login">
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                type="submit" id="btn_login">로그인</button>
                </form>`;

            var content = `
            <div id="login_content">
                <h3 style='text-align: left; padding:20px 0 0 30px; margin:0;'>로그인</h3>
                <hr>
                <form id="login_process" action="/auth/login_process" method="post">
                    <ul id = "login_list">
                        <li>
                            <input class="input_box" type="text" name="login_id" placeholder="ID">
                        </li>
                        <li>
                            <input class="input_box" type="password" name="login_pwd" placeholder="PASSWORD">
                        </li>
                        <li id="login_btn">
                            <button type="submit" id="login_btn_a">LOGIN
                        </li>
                    </ul>
                </form>
                <div style="margin:10px auto 0 40px;">
                    <a href="/auth/register" style="margin-right: 30px;">회원가입</a>
                    <a href="/auth/find_info">아이디/비밀번호 찾기</a>
                </div>
                <hr>
            </div>`;
            var html = template.basic(title, login, nav, content);
            response.send(html);
        }
    });

    router.post('/login_process',
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/auth/login',
            failureFlash: true
        })
    );

    router.get('/logout', function (request, response) {
        request.session.save(function () {  // 데이터 저장이 끝났을때 호출됨 안전하게 redirect하기 위함
            response.redirect('/');
        });
        request.session.destroy();
    });

    router.get('/register', function (request, response) {
        var title = '';
        var nav = '';
        var login = `
        <form action="/auth/login">
        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
        type="submit" id="btn_login">로그인</button>
        </form>`;
        var content = `
        <div id="login_content">
        <h3 style='text-align: left; padding:20px 0 0 30px; margin:0;'>회원가입</h3>
        <hr>
        <form id="register_process" method="post">
            <ul id = "regist_list">
                <li>
                    <input class="input_box" type="text" id="auth_name" name="auth_name" placeholder="이름" onblur="check_name();">
                    <article id="nameMsg"></article>
                </li>
                <div style="margin:0; padding: 0;">
                    <li style="position:relative;">
                    <input class="input_box" type="text" id="auth_id" name="auth_id" placeholder="ID" onblur="check_id();">
                    <article id="idMsg"></article>
                    </li>
                </div>
                <li>
                    <input class="input_box" type="password" id="auth_pwd1" name="auth_pwd" placeholder="PASSWORD" onblur="check_pwd1();">
                    <article id="pwdMsg1"></article>
                </li>
                <li>
                    <input class="input_box" type="password" id="auth_pwd2" name="auth_pwd_check" placeholder="PASSWORD 확인" onblur="check_pwd2();">
                    <article id="pwdMsg2"></article>
                </li>
                <li>
                    <input class="input_box" type="text" id="auth_birth" name="auth_birth" placeholder="생년월일 ex)1999-05-05" maxlength="10" onblur="check_birth();">
                    <article id="birthMsg"></article>
                </li>
                <div style="margin:0; padding: 0;">
                    <li style="position:relative;">
                    <input class="input_box" type="text" id="auth_email" name="auth_email" placeholder="이메일" onblur="check_email();">
                    <button formaction="eamil_send" class="btn regist_btn_a" style="font-size: 12px; padding:0;">인증번호보내기</button>
                    <article id="emailMsg"></article>
                    </li>
                </div>
                <div style="margin:0; padding: 0;">
                    <li style="position:relative;">
                    <input class="input_box" type="text" name="auth_email_check" placeholder="인증번호">
                    <button href="#" class="btn regist_btn_a">확인</button>
                    </li>
                </div>
                <button type="submit" formaction="../my_info/register_process" class="btn regist_btn_a" style="width:100%; position:static; margin-top: 30px;" onclick="return regist_check();">회원가입</button>
            </ul>
        </form>
        <hr>
        <script>
            function check_name(){
                var checkingName = document.getElementById("auth_name").value;
                if(checkingName === ""){
                    document.querySelector("#nameMsg").innerHTML = "필수 항목입니다.";
                    return false;
                } else{
                    document.querySelector("#nameMsg").innerHTML = "OK";
                    return true;
                }
            }
            function check_id(){
                var checkingId = document.getElementById("auth_id").value;
                var isId = /^[a-zA-Z0-9][-\\w]{4,19}$/;

                if(checkingId===""){
                    document.querySelector("#idMsg").innerHTML = "필수 항목입니다.";
                    return false;
                } else if(!isId.test(checkingId)){
                    document.querySelector("#idMsg").innerHTML = "5~20자의 영문 소문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.";
                    return false;
                } else{
                    var data = { id: checkingId };
                    fetch('../my_info/checkId',{
                        headers: { 'Content-Type': 'application/json' },
                        method:'POST', body:JSON.stringify(data)})
                        .then(res => res.json())
                        .then(json => {document.querySelector("#idMsg").innerHTML = json.msg; window.temp_idCheck_value = json.value;});
                    return window.temp_idCheck_value;
                }
            }
            function check_pwd1(){
                var checkingPwd = document.getElementById("auth_pwd1").value;
                var isPwd = /^[\\w\`~!@#$%^&*()-=+[{\\]}\\\\|;:'",<.>/?]{8,16}$/;
                if(checkingPwd===""){
                    document.querySelector("#pwdMsg1").innerHTML = "필수 항목입니다.";
                    return false;
                } else if(!isPwd.test(checkingPwd)){
                    document.querySelector("#pwdMsg1").innerHTML = "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.";
                    return false;
                } else{
                    document.querySelector("#pwdMsg1").innerHTML = "사용가능한 비밀번호입니다.";
                    return true;
                }
            }
            function check_pwd2(){
                var checkingPwd1 = document.getElementById("auth_pwd1").value;
                var checkingPwd2 = document.getElementById("auth_pwd2").value;
                if(checkingPwd2===""){
                    document.querySelector("#pwdMsg2").innerHTML = "필수 항목입니다.";
                    return false;
                }
                if(checkingPwd1===checkingPwd2){
                    document.querySelector("#pwdMsg2").innerHTML = "비밀번호가 일치합니다.";
                    return true;
                } else{
                    document.querySelector("#pwdMsg2").innerHTML = "비밀번호가 일치하지 않습니다.";
                    return false;
                }
            }
            function check_birth(){
                var checkingBirth = document.getElementById("auth_birth").value;
                console.log(checkingBirth);
                var isBirth = /(^\\d{4})[-](\\d{2})[-](\\d{2})$/;
                
                if(checkingBirth === ""){
                    document.querySelector("#birthMsg").innerHTML = "필수 항목입니다.";
                    return false;
                } else if(!isBirth.test(checkingBirth)){
                    document.querySelector("#birthMsg").innerHTML = "올바르게 입력해주세요.";
                    return false;
                } else{
                    var yy = checkingBirth.match(isBirth)[1]*1;
                    var mm = checkingBirth.match(isBirth)[2]*1;
                    var dd = checkingBirth.match(isBirth)[3]*1;

                    if(!(yy>=1900 && yy<=2019 && mm>=1 && mm<=12 && dd>=1 && dd<=31)){
                        document.querySelector("#birthMsg").innerHTML = "올바르게 입력해주세요.";
                        return false;
                    } else{
                        document.querySelector("#birthMsg").innerHTML = "OK";
                        return true;
                    }
                }
            }
            function check_email(){
                var checkingEmail = document.getElementById("auth_email").value;
                var isEmail = /^\\w+[@][a-z]+[.][a-z]+$/;
                if(checkingEmail === ""){
                    document.querySelector("#emailMsg").innerHTML = "필수 항목입니다.";
                    return false;
                } else if(!isEmail.test(checkingEmail)){
                    document.querySelector("#emailMsg").innerHTML = "올바르게 입력해주세요.";
                    return false;
                } else{
                    document.querySelector("#emailMsg").innerHTML = "OK";
                    return true;
                }
            }
            function regist_check(){
                var nameReturn = check_name();
                var idReturn = check_id();
                var pwdReturn1 = check_pwd1();
                var pwdReturn2 = check_pwd2();
                var birthReturn = check_birth();
                var emailReturn = check_email();
                console.log(nameReturn && idReturn && pwdReturn1 && pwdReturn2 && birthReturn && emailReturn);
                console.log(nameReturn, idReturn, pwdReturn1, pwdReturn2, birthReturn, emailReturn);
                var returnValue = nameReturn && idReturn && pwdReturn1 && pwdReturn2 && birthReturn && emailReturn;
                if(returnValue){
                    alert("회원가입이 완료되었습니다.");
                    return returnValue
                } else{
                    alert("입력정보를 확인해주세요.");
                    return returnValue
                }
            }
        </script>
        </div>`;

        var html = template.basic(title, login, nav, content);
        response.send(html);
    });

    router.post('/register_process', function (request, response) {
        var post = request.body;
        var salt = '';
        var hashingPwd = '';
        crypto.randomBytes(64, (err, buf) => {
            if (err) throw err;
            salt = buf.toString('hex');

            // hashing
            crypto.pbkdf2(post.auth_pwd, salt, 112311, 64, 'sha512', (err, derivedKey) => {
                if (err) throw err;
                hashingPwd = derivedKey.toString('hex');

                // sql insert
                var insert_sql = 'INSERT INTO user_info (id, salt, pwd, name, birth, email) VALUES (?,?,?,?,?,?);';
                conn.query(insert_sql, [post.auth_id, salt, hashingPwd, post.auth_name, post.auth_birth, post.auth_email], function (error, users) {
                    if (error) {
                        throw error;
                    }
                    response.redirect('/auth/login');
                });
            });
        });
    });

    router.get('/find_info', function (request, response) {
        if (auth.isLogin(request, response)) {
            response.redirect('/');
        }
        else {
            var title = '';
            var nav = '';
            var login = auth.statusUI(request, response);
            var content = `<div id="find_id">
            <h2>아이디 찾기</h2>
            <br>
            <form action="/auth/find_id_process" method="POST">
                <label name="name">
                    <p>이&nbsp;&nbsp;름 : <input type="text" placeholder="이름을 입력하세요." name="name" style="float: center;"></p>
                </label>
                <br>
                <label name="email">
                    <p>이메일 : <input type="text" placeholder="이메일을 입력하세요." name="email" style="float: center;"></p>
                </label>
                <br>
                <br>
                <br>
                <button type="submit" class="btn" id="btn_find_id" style="float: right;">아이디 찾기</button>
            </form>
            </div>
      
            <div id="find_pwd">
            <h2>비밀번호 찾기</h2>
            <br>
            <form action="/auth/find_pwd_process" method="POST">
                <label name="id">
                    <p>이&nbsp;&nbsp;름 : <input type="text" placeholder="이름을 입력하세요." name="name" style="float: center;"></p>
                </label>
                <br>
                <label name="email">
                    <p>이메일 : <input type="text" placeholder="이메일을 입력하세요." name="email" style="float: center;"></p>
                </label>
                <br>
                <label name="id">
                    <p>비밀번호 : <input type="text" placeholder="아이디를 입력하세요." name="id" style="float: center;"></p>
                </label>
                <br>
                <button type="submit" class="btn" id="btn_find_pwd" style="float: right;">비밀번호 찾기</button>
            </form>
            </div>`;
            var html = template.basic(title, login, nav, content);
            response.send(html);
        }
    });

    router.post('/find_id_process', function (request, response) {
        if (auth.isLogin(request, response)) {
            response.redirect('/auth/find_info');
            return false;
        }
        var post = request.body;
        var name = post.name;
        var email = post.email;

        var sql = 'SELECT id FROM user_info WHERE name=? AND email=?'
        conn.query(sql, [name, email], function (error, results) {
            if (error) {
                throw error;
            }
            if (results[0]) {
                response.send(results[0]);
                // 아이디를 어떻게 알려줄 것인가?
                // alert 관련?
            }
            else {
                response.send('no result');
                // alert와 관련된 부분
            }
        });
    });

    router.post('/find_pwd_process', function (request, response) {
        if (auth.isLogin(request, response)) {
            response.redirect('/auth/find_info');
            return false;
        }
        var post = request.body;
        var name = post.name;
        var email = post.email;
        var id = post.id;

        var sql = 'SELECT pwd FROM user_info WHERE id=? AND name=? AND email=?'
        conn.query(sql, [id, name, email], function (error, results) {
            if (error) {
                throw error;
            }
            if (results[0]) {
                response.send(results[0]);
                // 비밀번호를 어떻게 알려줄 것인가?
                // 비밀번호 hashing하면 원래 비밀번호를 알려줄수가 없는데
                // 임시로 비밀번호를 재발급할 것인가?
                // 이러면 또 정보수정이랑도 연관이 되어버림 (비밀번호 수정)
                // alert 관련?
            }
            else {
                response.send('no result');
                // alert와 관련된 부분
            }
        });
        response.send(name + email + pwd);
    });
    return router;
}
// router.get('/login', function (request, response) {
//     var flash_msg = request.flash();
//     var feedback = ``;
//     if(flash.error){
//         feedback = flash_msg.error[0];
//     }

//     var title = ``;
//     var nav = ``;
//     var login = `<form action="/auth/login">
//     <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
//     type="submit" id="login">로그인</button>
//     </form>`;

//     var content = `<form action="/auth/login_process" method="POST">
//         <p>아이디 : <input type="text" name="id" placeholer="아이디를 입력해주세요."></p>
//         <p>비밀번호 : <input type="password" name="pwd" placeholer="비밀번호를 입력해주세요."></p>
//         <p><input type="submit" value="로그인"></p>
//         </form>
//         <div id="flash_msg">${feedback}</div>
//         `;

//     var html = template.basic(title, login, nav, content);
//     response.send(html);
// });

// /* passport 관련 부분. 나중에 더 알아봐야 함
// router.post('/login_process', passport.authenticate('local', {
//     failureRedirect: '/'
// }), (req, res) => {
//     res.redirect('/');
// });
// */


// // router.post('/login_process', function (request, response) {
// //     var post = request.body;
// //     var id = post.id;
// //     var password = post.pwd + "";

// //     // salt, hash 부분 table에 추가해야 할 수도 있음
// //     var sql = 'SELECT pwd FROM user_info WHERE id=?';
// //     conn.query(sql, [id], function (error, results, field) {
// //         if (error) {
// //             throw error;
// //         }
// //         if (results[0] === undefined) {
// //             console.log("There is no such id.");
// //             response.redirect('/');
// //         }
// //         else {
// //             if (password === results[0].pwd) {
// //                 request.session.is_logined = true;
// //                 request.session.user_id = id;
// //                 request.session.save(function () {
// //                     response.redirect(`/`);
// //                 });
// //             } else {
// //                 response.send('Who?');
// //             }
// //             // response.redirect(`/topic/${title}`);

// //             /* bcrypt 관련 더 알아보고 마저 수정해야 함
// //             bcrypt.compare(req.body.password, results.password, function (err, result) {
// //                 if (result) {
// //                     res.redirect('/');
// //                 } else {
// //                     res.send('Incorrect password');
// //                     res.redirect('/');
// //                 }
// //             });
// //             */
// //         }
// //     });
// // });


// router.get('/logout', function (request, response) {
//     request.logout();
//     request.session.save(function(){
//         response.redirect('/');
//     });

//     // request.session.destroy(function (err) {
//     //     response.redirect('/');
//     // });
// });

// router.get('/my_info', function(request, response){

// });

// module.exports = router;
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