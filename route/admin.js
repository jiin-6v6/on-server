var express = require('express');
var router = express.Router();
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var mysql = require('mysql');
var auth = require('../lib/auth.js');

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mintchoco',
    database: 'community',
    dateStrings: 'date'
});
conn.connect();

router.get('/:report_page', function (request, response) {
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    if (!request.user.isAdmin){
        response.redirect('/');
        return false;
    }
    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>관리자</h2>
        <p id="side-list"><a href="/admin/1">신고</a></p>
        <p id="side-list"><a href="/">회원 신고 누적횟수</a></p>
        </nav>`;
    var content = ``;
    var report_page = sanitizeHtml(request.params.report_page);
    report_page = Number(report_page);
    var sql = "SELECT * FROM report WHERE state=0";
    conn.query(sql, function (error, results, field) {
        if (error) {
            throw error;
        }
        if (results.length==0){
            content = `<div id="content">
            <div>
            신고가 존재하지 않습니다.
            </div></div>`;
        }
        else{
            var total_page = parseInt((results.length-1)/5) + 1;
            if (report_page > total_page){
                wrongPath = true;
                response.redirect('/');
                return false;
            }
            content = template.reportlist(results, report_page, total_page);
            content += template.pagination(report_page, total_page);
        }
        var html = template.basic(title, login, nav, content);
        response.send(html);
    });
});

router.post('/reject',function(request,response){
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    if (!request.user.isAdmin){
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE report SET state=2 WHERE report_id=?";
            conn.query(sql, [post.report_id], function(error, results, field){
                if (error) {
                    throw error;
                }
                response.redirect('/admin/'+post.report_page);
            });
});

module.exports = router;