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
        <p id="side-list"><a href="/admin/report_cnt/1">회원 신고 누적횟수</a></p>
        </nav>`;
    var content = ``;
    var report_page = sanitizeHtml(request.params.report_page);
    report_page = Number(report_page);
    var sql = "SELECT * FROM report WHERE state=0 AND comment_id>0";
    conn.query(sql, function (error, results, field) {
        if (error) {
            throw error;
        }
        var sql2 = "SELECT * FROM report WHERE state=0 AND comment_id=0";
        conn.query(sql2,function(error2,results2){
            if (error2) {
                throw error2;
            }
            var array = results.concat(results2);
            if (array.length==0){
                content = `<div id="content">
                <div>
                신고가 존재하지 않습니다.
                </div></div>`;
            }
            else{
                var total_page = parseInt((array.length-1)/5) + 1;
                if (report_page > total_page){
                    wrongPath = true;
                    response.redirect('/');
                    return false;
                }
                content = template.reportlist(array, report_page, total_page);
                content += template.pagination_reportlist(report_page, total_page);
            }
            var html = template.basic(title, login, nav, content);
            response.send(html);
        })
        
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

router.get('/report_cnt/:report_cnt_page', function(request, response){
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    if (!request.user.isAdmin){
        response.redirect('/');
        return false;
    }

    var report_cnt_page = sanitizeHtml(request.params.report_cnt_page);
    report_cnt_page = Number(report_cnt_page);

    var login = auth.statusUI(request, response);
    var title = ``;
    var nav = `<nav>
        <h2>관리자</h2>
        <p id="side-list"><a href="/admin/1">신고</a></p>
        <p id="side-list"><a href="/admin/report_cnt/1">회원 신고 누적횟수</a></p>
        </nav>`;
    var content = ``;


    var sql = "SELECT user_info.id AS id, report.report_content AS report_content, user_info.report_cnt AS report_cnt, report.time AS time FROM user_info INNER JOIN report ON user_info.id = report.reported_id WHERE report.state=1 AND user_info.state=0 AND report_cnt>=3 ORDER BY report_cnt DESC, id ASC";
    conn.query(sql, function (error, results, field) {
        if (error) {
            throw error;
        }
        if (results.length==0){
            content = `<div id="content">
            <div>
            누적된 신고가 존재하지 않습니다.
            </div></div>`;
            var html = template.basic(title, login, nav, content);
            response.send(html);
        }
        else{
            var sql2 = "SELECT count(*) AS id_cnt FROM user_info WHERE report_cnt>=3 AND state=0"
            conn.query(sql2, function(error2, results2, field){
                if (error2){
                    throw error2;
                }
                var total_reported_id = results2[0].id_cnt;
                var total_page = parseInt((total_reported_id-1)/3) + 1;
                if (report_cnt_page > total_page){
                    wrongPath = true;
                    response.redirect('/');
                    return false;
                }
                content += template.reportcntlist(results, report_cnt_page, total_page, total_reported_id);
                content += template.pagination_reportcntlist(report_cnt_page, total_page);
                var html = template.basic(title, login, nav, content);
                response.send(html);
            });
        }
    });




});

// router.get('/report_cnt/:report_cnt_page', function (request, response) {
    
    
    
    
// });

router.post('/out',function(request,response){
    if (!auth.isLogin) {
        response.redirect('/');
        return false;
    }
    if (!request.user.isAdmin){
        response.redirect('/');
        return false;
    }
    var post = request.body;
    var sql = "UPDATE user_info SET state=2 WHERE id=?";
    conn.query(sql, [post.report_id], function(error, results, field){
        if (error) {
            throw error;
        }
        response.redirect('/admin/report_cnt/'+post.report_cnt_page);
    });
});

module.exports = router;