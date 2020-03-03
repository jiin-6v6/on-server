var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

router.get('/', function (request, response) {
    var title = ``;
    if (!auth.isLogin(request, response)) {
        nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1" onClick="alert('로그인이 필요한 서비스입니다.'); return false;">익명게시판</a></p>
        </nav>`;
    }
    else {
        nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
        </nav>`;
    }
    var content = `<div id="content"><img src="/icebear.png" width=500px></div>`;
    var login = auth.statusUI(request, response);
    html = template.basic(title, login, nav, content);
    response.send(html);
});

module.exports = router;