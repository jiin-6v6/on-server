var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

router.get('/', function(require, response){
    var title = ``;
    var nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/0">공지사항</a></p>
        <p id="side-list"><a href="/board/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/2">익명게시판</a></p>
        </nav>`;
    var content = `<img src="/icebear.png" width=500px>`;
    var login = auth.statusUI(require, response);

    /*
    var alert = ``;
    
    if(wrongPath){
        wrongPath = false;
        alert = `<script type="text/javascript>alert("Hello, World!");</script>`;
    }
    */
    html = template.basic(title, login, nav, content);
    response.send(html);
});

module.exports = router;