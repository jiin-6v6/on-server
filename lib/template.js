module.exports = {
    basic: function (title, login, nav, content) {
        return `
            <!doctype html>
            <html lang="ko">
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>다미부기${title}</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
                <link href="https://fonts.googleapis.com/css?family=Nanum+Gothic+Coding&display=swap" rel="stylesheet">
                <link rel="stylesheet" type="text/css" href="/style.css" />
                <script src="https://use.fontawesome.com/releases/v5.12.1/js/all.js"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
            </head>
      
            <body>
                <header>
                    <div id="login">
                        ${login}
                    </div>
                    <div class="container"><a href="/"><img src="/icon.png" id="header_title" width = 300px></a></div>
                </header>

                <hr class = 'one'></hr>

                <main class="container">
                    ${content}
                    ${nav}
                </main>
          
                <footer>
                    <div class="container"></div>
                </footer>     
            </body>
        </html>
        `;
    }, list: function (filelist) {      // 아저씨꺼
        var list = '<ul>';
        var i = 0;
        while (i < filelist.length) {
            list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + '</ul>';
        return list;
    }, postlist: function (results, boardId, this_page) {       // board.js
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'><center>번호</center></th><th style='width:60%; padding-left:12px !important;'><center>제목</center></th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            if (results[i].isUpdate === 0)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].post_writer}</td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
            else if (results[i].isUpdate === 1)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].post_writer}</td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}<br>(수정됨)</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, postlist_anony: function (results, boardId, this_page) {     // board.js
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'><center>번호<center></th><th style='width:60%; padding-left:12px !important;'><center>제목</center></th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            if (results[i].isUpdate === 0)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'>익명</td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
            else if (results[i].isUpdate === 1)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'>익명</td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}<br>(수정됨)</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, post_write_update: function (request, boardId, postId, results) {       // board.js
        var select_notice = ``;
        var select_free = ``;
        var select_anony = ``;
        if (boardId === 'notice') {
            select_notice = `selected="true"`;
        }
        else if (boardId === 'free') {
            select_free = `selected="true"`;
        }
        else if (boardId === 'anonymous') {
            select_anony = `selected="true"`;
        }
        else {
            return false
        }
        
        var notice = '';
        
        if (request.user.isAdmin) {
            notice = `<option ${select_notice} value="notice">공지사항</option>`;
        }

        // for write post
        if (!results) {  // update가 아닌 경우 results===null
            var content = `
                <div id="content">
                    <form action="/board/write_process" method="POST">
                        <select name="category" onclick="check_category();">
                            <option value="" disabled="disabled">카테고리 선택</option>
                            ${notice}
                            <option ${select_free} value="free">자유게시판</option>
                            <option ${select_anony} value="anonymous">익명게시판</option>
                        </select>
                        <input type="text" id="post_title" name="post_title" placeholder="제목을 입력하세요.">
                        <br><br>
                        <textarea id="post_content" name="post_content" placeholder="내용을 입력하세요."></textarea>
                        <br><br>
                        <input type="file" name="post_file">
                        <br>
                        <input type="submit" id="to_post" style="position: absolute; right: 130px;">
                    </form>
                </div>
                <script>
                function check_category(){
                    var category = document.getElementById("category");
                    var value = category.options[category.selectedIndex].value();
                    console.log(value);
                    if(value !== "notice" && value !== "free" && value !== "anonymous"){
                        alert("카테고리를 지정해주세요.");
                        return false;
                    }
                    return true;
                }
            </script>`;
            return content;
        }

        // for update post
        if (results[0].post_writer !== request.user.id) { // 작성자가 아닌 경우
            return false;
        }

        if (results && postId) {
            var content = `
            <div id="content">
                <form action="/board/update_process/${postId}" method="POST">
                    <select id="category" name="category" onchange="check_category();">
                        <option value="" disabled="disabled">카테고리 선택</option>
                        ${notice}
                        <option ${select_free} value="free">자유게시판</option>
                        <option ${select_anony} value="anonymous">익명게시판</option>
                    </select>
                    <input type="text" id="post_title" name="post_title" placeholder="제목을 입력하세요." value="${results[0].post_title}">
                    <br><br>
                    <textarea id="post_content" name="post_content" placeholder="내용을 입력하세요.">${results[0].post_content}</textarea>
                    <br><br>
                    <input type="file" name="post_file">
                    <br>
                    <input type="submit" name="to_post" style="position: absolute; right: 130px;">
                </form>
            </div>
            <script>
                function check_category(){
                    var category = document.getElementById("category");
                    var value = category.options[category.selectedIndex].value();
                    console.log(value);
                    if(value !== "notice" && value !== "free" && value !== "anonymous"){
                        alert("카테고리를 지정해주세요.");
                        return false;
                    }
                    return true;
                }
            </script>`;
            return content;
        }
        else {   // results!=null but postId==null인 경우
            return false;
        }
    }, look_post: function (request, results) {     // board.js
        var category = '';
        var post_writer = results[0].post_writer;
        var boardId = results[0].board_id;
        var postId = results[0].id;
        if (boardId == 'anonymous') {
            category = '익명게시판';
            post_writer = '익명';
        }
        else if (boardId == 'free') {
            category = '자유게시판';
        }
        else if (boardId == 'notice') {
            category = '공지사항';
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
        else {
            button = `<div id="report" style="text-align: right;">
                <a href="javascript:void(window.open('/report/${boardId}/${postId}', '다미부기 - 신고하기', 'width=600px, height=350px'))" id="post_report">신고하기</a>
            </div>`;
        }
        if (request.user.isAdmin) {
            button = `<div id="post_modify" style="text-align: right;">
            <form action="" method="POST">
                <input type="submit" id="post_delete" value="삭제하기" formaction="/board/delete/${boardId}/${postId}">
            </form>
            </div>`;
        }
        var post_content = results[0].post_content.replace(/\r\n/gi, "<br>");

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
            </div>`;
        return content;
    }, comment_list_update: function (request, results, boardId, postId, commentId, alarm) {      // board.js
        if (!results) {     // results === null
            return false;
        }

        if (!results[0]) {    // results === [] 
            var comment = `댓글이 존재하지 않습니다.`;
            var content = `<div id="comments">
                    <form action="/comment/${boardId}/${postId}" method="POST">
                        <input type="hidden" name="comment_writer" value="${request.user.id}">
                        <textarea id="comment_content" name="comment_content" placeholder="댓글을 입력하세요." style="width: 600px; height: 70px;"></textarea>
                        <input type="submit" id="comment" value="댓글달기">
                    </form>
                    <br>
                        ${comment}
                </div>            
                </div>
            </div>`;
            return content;
        }

        if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
            wrongPath = true;
            return false;
        }

        var comment = ``;
        var array = [];

        array.push(`<table class="table" id="comment_${results[0].post_id}">
            <thead>
                <tr id="comment_table_tr">
                    <th>댓글</th>
                </tr>
            </thead>
            <tbody>`);

        for (i = 0; i < results.length; i++) {
            if ((results[i].isDelete === 1) && (results[i].parent_id !== 0)) {
                continue;
            }

            var isUpdate = ``;
            var isDelete = ``;
            if (results[i].isUpdate === 1) {
                isUpdate = `(수정됨)`;
            }

            // 댓글 작성자 처리 부분
            var comment_writer = results[i].comment_writer;
            if (boardId === 'anonymous') {
                comment_writer = '익명' + results[i].unknown;
            }
            var table_comment_writer = `<td colspan='2' style = 'width:70%; text-align:left; vertical-align:middle;'>${comment_writer}</td>`;

            // 댓글 수정하기 & 삭제하기
            var comment_update = '';
            var comment_delete = '';

            if (results[i].comment_writer === request.user.id) {
                comment_update = `<a href='/comment/update/${boardId}/${postId}/${results[i].id}'>수정</a>`;
                comment_delete = `<a href='/comment/delete/${boardId}/${postId}/${results[i].id}'>삭제</a>`;
            }
            else if (request.user.isAdmin) {
                comment_delete = `<a href='/comment/delete/${boardId}/${postId}/${results[i].id}'>삭제</a>`;
            }
            else {
                comment_delete = `<a href="javascript:void(window.open('/report/${boardId}/${postId}/${results[i].id}', '다미부기 - 신고하기', 'width=600px, height=350px'))">신고</a>`
            }

            var reply = `<a href='#' onclick='reply("${boardId}", ${postId}, ${results[i].id}); return false;'>↩︎</a>`;

            // 댓글 내용
            var table_comment_content = `<td colspan='2' style = 'width:70%; text-align:left; vertical-align:middle;'>${results[i].comment_content.replace(/\r\n/gi, "<br>")}</td>`;
            if (results[i].parent_id !== 0) {   // 대댓글인 경우
                table_comment_writer = `<td style = 'width:10%; text-align:center;'>↳</td>
                    <td style = 'width:60%; text-align:left; vertical-align:middle;'>${comment_writer}</td>`;
                table_comment_content = `<td style = 'width:10%; text-align:center;'></td>
                    <td style = 'width:60%; text-align:left; vertical-align:middle;'>${results[i].comment_content.replace(/\r\n/gi, "<br>")}</td>`;
                reply = ``;
            }
            if (results[i].isDelete === 1) {    // 삭제된 댓글인 경우
                table_comment_writer = `<td colspan='2' style = 'width:70%; text-align:left; vertical-align:middle;'>삭제됨</td>`;
                table_comment_content = `<td colspan='2' style = 'width:70%; text-align:left; vertical-align:middle;'>작성자에 의해 삭제된 댓글입니다.</td>`;
            }
            var button = `<td style = 'width:5%; text-align:center; vertical-align:middle;'></td>
            <td style = 'width:10%; text-align:center; vertical-align:middle;'>${comment_update}</td>
            <td style = 'width:10%; text-align:center; vertical-align:middle;'>${comment_delete}</td>
            <td style = 'width:5%; text-align:center; vertical-align:middle;'>${reply}</td>
            `;
            if (!alarm && commentId && (results[i].id === commentId)) {   // comment update mode
                table_comment_content = `<td colspan='5' style = 'width:100%;text-align:left; vertical-align:middle;'>
                    <form action="/comment/update_process/${boardId}/${postId}/${commentId}" method="POST">
                        <textarea name="comment_content" placeholder="댓글을 입력하세요." style='width:80%;'>${results[i].comment_content.replace(/\r\n/gi, "<br>")}</textarea>
                        <input type="submit" class="btn" id="btn_comment_update" value="수정하기">
                    </form></td>`;
                button = '';
            }

            var index = (results[i].parent_id === 0) ? 1 : array.findIndex(element => element.includes(`<tr id="${results[i].parent_id}_info">`)) + 2;
            array.splice(index, 0, `<tr id="${results[i].id}_info">`);
            array.splice(index + 1, 0, `${table_comment_writer}
                            <td colspan='4' style = 'width:30%; text-align:center; vertical-align:middle;'>${results[i].time}${isUpdate}</td>
                        </tr>
                        <tr id="${results[i].id}_content">
                        ${table_comment_content}
                        ${button}
                        </tr>`);
            if (results[i].parent_id === 0) {
                array.splice(index + 2, 0, `<tr>
                    <td colspan='5' style='width:95%; text-align:center; vertical-align:middle;'>
                        <div id="${results[i].id}_reply"></div>
                    </td>
                    <td style='width:5%; text-align:center; vertical-align:middle;'>
                        <div id="${results[i].id}_close"></div>
                    </td>
                    </tr>`);
            }
        }
        array.push(`</tbody></table>`);
        comment = array.join('');

        var content = `<div id="comments">
                    <form action="/comment/${boardId}/${postId}" method="POST">
                        <input type="hidden" name="comment_writer" value="${request.user.id}">
                        <textarea id="comment_content" name="comment_content" placeholder="댓글을 입력하세요." style="width: 600px; height: 70px;"></textarea>
                        <input type="submit" id="comment" value="댓글달기">
                    </form>
                    <br>
                        ${comment}
                </div>            
                </div>
            </div>
            <script type="text/javascript">
                    var commentId = ${commentId};
                    var alarm = ${alarm};
                    if (commentId !== 0 && alarm) {
                        var info = document.getElementById(commentId + "_info");
                        var content = document.getElementById(commentId + "_content");
                        info.style.color = "red";
                        content.style.color = "red";
                    }
                    function reply(boardId, postId, commentId) {
                        var text = "<form action='/comment/reply/";
                        text += boardId;
                        text += "/";
                        text += postId;
                        text += "/";
                        text += commentId;
                        text += "' method='POST'><input type='hidden' name='comment_writer' value='${request.user.id}'><textarea name='comment_content' placeholder='댓글을 입력하세요.' style='width:80%;'></textarea>";
                        text += "<input type='submit' class='btn' id='btn_comment_update' value='댓글달기'></input></form>";
                        
                        document.getElementById(commentId + "_reply").innerHTML = text;
                        document.getElementById(commentId + "_close").innerHTML = "<a href='#' onclick='reply_close(" + commentId + "); return false;'>X</a>"
                    }
                    function reply_close(commentId){
                        document.getElementById(commentId + "_reply").innerHTML = "";
                        document.getElementById(commentId + "_close").innerHTML = "";
                    }
                </script>`;
        return content;
    }, pagination_board: function (boardId, this_page, total_page) {        // board.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/board/${boardId}/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/board/${boardId}/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/board/${boardId}/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/board/${boardId}/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/board/${boardId}/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/board/${boardId}/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/board/${boardId}/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/board/${boardId}/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/board/${boardId}/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/board/${boardId}/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/board/${boardId}/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/board/${boardId}/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/board/${boardId}/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }, myinfo: function (results) {     // my_info.js
        return `
        <div id="content">
            <div id="my_info">
                <h2>내 정보</h2>
                <p>이름 : ${results[0].name}</p>
                <p>아이디 : ${results[0].id}</p>
                <p>이메일 : ${results[0].email}</p>
                <p>생년월일 : ${results[0].birth}</p>
                <p>신고 누적횟수 : ${results[0].report_cnt}회</p>
            </div>
            <br>
            <br>
            <br>
            <br>
            <br>
            <form action="/my_info/update" method="POST">
                <input type="hidden" name="user_name" value="${results[0].name}">
                <input type="hidden" name="user_id" value="${results[0].id}">
                <input type="hidden" name="user_email" value="${results[0].email}">
                <input type="hidden" name="user_birth" value="${results[0].birth}">
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_update">수정하기</button>
            </form></div>`
    }, update: function (post) {        // my_info.js
        return `
        <div id="content">
        <h3 style='text-align: left; padding:20px 0 0 30px; margin:0;'>내 정보</h3><hr>
        <form id="update_process" method="post">
        <ul id = "regist_list">
        <li style="position:relative;">
                <strong>아이디&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" id="auth_id" type="text" name="auth_id" value="${post.user_id}" placeholder="ID" onblur="check_id();">
                <article id="idMsg"></article>
                </li>
                <li>
                <strong>비밀번호&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="password" id="auth_pwd1" name="auth_pwd" placeholder="PASSWORD" onblur="check_pwd1();">
                <article id="pwdMsg1"></article>
                </li>
                <li>
                <strong>비밀번호 확인&nbsp : &nbsp</strong>
                <input class="input_box" type="password" id="auth_pwd2" name="auth_pwd_check" placeholder="PASSWORD 확인" onblur="check_pwd2();">
                <article id="pwdMsg2"></article>
                </li>
                <li>
                <strong>생년월일&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="text" id="auth_birth" name="auth_birth" value="${post.user_birth}" placeholder="ex)1995-05-15" maxlength="10" onblur="check_birth();">
                <article id="birthMsg"></article>
                </li>
                <li style="position:relative;">
                <strong>이메일&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="text" name="auth_email" value="${post.user_email}" placeholder="이메일">
                <button type="submit" formaction="email_send" class="regist_btn_a" style="font-size: 10px;">인증번호보내기</button>
                </li>
                <li style="position:relative;">
                <strong>인증번호&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="text" name="auth_email_check" placeholder="인증번호">
                <button type="submit" formaction="email_check" class="regist_btn_a">확인</button>
                </li>
                <div style="position: relative;">
                <button type="submit" formaction="/my_info/update_process" class="regist_btn_a" style="position: absolute; margin-top: 30px; left:200px;">수정</button>
                </div>
                </ul>
                </form>
                </div>
                <script>
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
 
                        fetch('checkId',{
                            headers: { 'Content-Type': 'application/json' },
                            method:'POST', body:JSON.stringify(data)})
                        .then(res => res.text())
                        .then(body => document.querySelector("#idMsg").innerHTML = body);
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
                    var yy = checkingBirth.match(isBirth)[1]*1;
                    var mm = checkingBirth.match(isBirth)[2]*1;
                    var dd = checkingBirth.match(isBirth)[3]*1;
    
                    if(!isBirth.test(checkingBirth)){
                      document.querySelector("#birthMsg").innerHTML = "올바르게 입력해주세요.";
                      return false;
                    } else if(!(yy>=1900 && yy<=2019 && mm>=1 && mm<=12 && dd>=1 && dd<=31)){
                      document.querySelector("#birthMsg").innerHTML = "올바르게 입력해주세요.";
                      return false;
                    } else{
                      document.querySelector("#birthMsg").innerHTML = "OK";
                      return true;
                    }
                }
                </script>`;
    }, alarmlist: function (results, this_page) {       // my_info.js
        var table = `<div id="content">
        <h2 style='text-align:left;'>알림</h2>
        <table class="table" id="report_table">
          <colgroup>
            <col width='80%'/>
            <col width='10%'/>
            <col width='10%'/>
          </colgroup>
          <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            table += `<tr id="report_table_tr">
            <td style='vertical-align:middle; text-align:left;'>`;
            if (results[i].board_id == 'anonymous') {
                if (results[i].parent_id == 0) {
                    table += `회원님의 게시글에 익명${results[i].unknown}님이 댓글을 달았습니다.`;
                }
                else {
                    table += `회원님의 댓글에 익명${results[i].unknown}님이 댓글을 달았습니다.`;
                }
            }
            else {
                if (results[i].parent_id == 0) {
                    table += `회원님의 게시글에 ${results[i].alarming_id}님이 댓글을 달았습니다.`;
                }
                else {
                    table += `회원님의 댓글에 ${results[i].alarming_id}님이 댓글을 달았습니다.`;
                }
            }
            table += `</td>
            <td style='vertical-align:middle;'>
              <form action="/my_info/alarm/view_process" method="POST">
                <input type="hidden" name="comment_id" value="${results[i].comment_id}">
                <input type="hidden" name="alarmed_id" value="${results[i].alarmed_id}">
                <input type="hidden" name="board_id" value="${results[i].board_id}">
                <input type="hidden" name="post_id" value="${results[i].post_id}">
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_view">보기</button>
              </form>
            </td>
            <td style='vertical-align:middle;'>
              <form action="/my_info/alarm/delete_process" method="POST">
                <input type="hidden" name="comment_id" value="${results[i].comment_id}">
                <input type="hidden" name="alarmed_id" value="${results[i].alarmed_id}">
                <input type="hidden" name="this_page" value="${this_page}">
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_delete">삭제</button>
              </form>
            </td>
          </tr>`;
        }
        table += `</tbody></table>`;
        return table;
    }, pagination_alarmlist: function (this_page, total_page) {     //my_info.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/my_info/alarm/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/my_info/alarm/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/alarm/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/alarm/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/alarm/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/my_info/alarm/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/my_info/alarm/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/my_info/alarm/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/my_info/alarm/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/my_info/alarm/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/my_info/alarm/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/my_info/alarm/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/alarm/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }, postlist_mypost: function (results, this_page) {     // my_info.js
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'><center>번호</center></th><th style='width:60%; padding-left:12px !important;'><center>제목</center></th><th style='min-width:80px;text-align:center;'>수정여부</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            if (results[i].isUpdate === 0)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${results[i].board_id}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-remove"></span></td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
            else if (results[i].isUpdate === 1)
                table += `
                <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                <a href="/board/${results[i].board_id}/0/${results[i].id}">${results[i].post_title}</a></span></td>
                <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-ok"></span></td>
                <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, postlist_mycomment: function (results, this_page) {      // my_info.js
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'><center>번호</center></th><th style='width:60%; padding-left:12px !important;'><center>제목</center></th><th style='min-width:80px;text-align:center;'>수정여부</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            if (results[i].isUpdate === 0)
                if (results[i].comment_content.length > 48)
                    table += `
                    <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                    <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                    <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                    <a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].comment_content.substring(0, 48)}..</a></span></td>
                    <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-remove"></span></td>
                    <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
                else
                    table += `
                    <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                    <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                    <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                    <a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].comment_content.substring(0, 48)}</a></span></td>
                    <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-remove"></span></td>
                    <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
            else if (results[i].isUpdate === 1)
                if (results[i].comment_content.length > 48)
                    table += `
                    <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                    <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                    <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                    <a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].comment_content.substring(0, 48)}..</a></span></td>
                    <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-ok"></span></td>
                    <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
                else
                    table += `
                    <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
                    <td class='mobile-hide' style = 'font-size : 11px; vertical-align : middle;'><center>${results[i].id}</center></td>
                    <td class='title title-align' style = 'vertical-align : middle;'><span class="">
                    <a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].comment_content.substring(0, 48)}</a></span></td>
                    <td style='text-align:center; vertical-align : middle;'><span class="glyphicon glyphicon-ok"></span></td>
                    <td style='text-align:center; vertical-align : middle;'>${results[i].time}</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, pagination_mypost: function (this_page, total_page) {        // my_info.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/my_info/mypost/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/my_info/mypost/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/mypost/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/mypost/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/mypost/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/my_info/mypost/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/my_info/mypost/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/my_info/mypost/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/board/${boardId}/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/my_info/mypost/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/my_info/mypost/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/my_info/mypost/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/mypost/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }, pagination_mycomment: function (this_page, total_page) {     // my_info.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/my_info/mycomment/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/my_info/mycomment/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/mycomment/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/mycomment/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/my_info/mycomment/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/my_info/mycomment/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/my_info/mycomment/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/my_info/mycomment/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/my_info/mycomment/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/my_info/mycomment/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/my_info/mycomment/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/my_info/mycomment/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/my_info/mycomment/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }, reportlist: function (results, report_page, total_page) {        // admin.js
        var table = `<div id="content">
        <h2 style='text-align:left;'>신고</h2>
        <table class="table" id="report_table">
          <thead>
            <tr id="report_table_tr">
              <th style='width:15%; text-align:center;'>회원ID</th>
              <th style='width:70%; text-align:center;'>추가설명</th>
              <th style='width:15%; text-align:center;'></th>
            </tr>
          </thead>
          <tbody>`;
        if (report_page < total_page) {
            for (var i = 5 * (report_page - 1); i < 5 * (report_page - 1) + 5; i++) {
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${results[i].reported_id}</td>
                <td style='vertical-align:middle;'><a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].report_content}</a></td>
                <td style='vertical-align:middle;'>
                  <form action="/admin/reject" method="POST">
                    <input type="hidden" name="report_id" value="${results[i].report_id}">
                    <input type="hidden" name="report_page" value="${report_page}">
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_reject">거부</button>
                  </form>
                </td>
              </tr>`;
            }
        }
        else {
            for (var i = 5 * (report_page - 1); i < results.length; i++) {
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${results[i].reported_id}</td>
                <td style='vertical-align:middle;'><a href="/board/${results[i].board_id}/0/${results[i].post_id}">${results[i].report_content}</a></td>
                <td style='vertical-align:middle;'>
                  <form action="/admin/reject" method="POST">
                    <input type="hidden" name="report_id" value="${results[i].report_id}">
                    <input type="hidden" name="report_page" value="${report_page}">
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_reject">거부</button>
                  </form>
                </td>
              </tr>`;
            }
        }
        table += `</tbody></table>`;
        return table;
    }, pagination_reportlist: function (this_page, total_page) {        // admin.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/admin/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/admin/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/admin/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/admin/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/admin/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/admin/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/admin/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/admin/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/admin/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/admin/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }, reportcntlist: function (results, report_cnt_page, total_page, total_reported_id) {      // admin.js
        var page_start = 0;
        for (var i = 0; i < 3 * (report_cnt_page - 1); i++) {
            var temp = page_start;
            for (var j = temp; j < temp + results[temp].report_cnt; j++) {
                page_start += 1;
            }
        }
        var table = `<div id="content">
        <h2 style='text-align:left;'>회원 신고 누적횟수</h2>
        <table class="table" id="report_table">
          <thead>
            <tr id="report_table_tr">
              <th style='width:20%; text-align:center;'>회원ID</th>
              <th style='width:50%; text-align:center;'>신고 사유</th>
              <th style='width:20%; text-align:center;'>신고 날짜</th>
              <th style='width:10%; text-align:center;'></th>
            </tr>
          </thead>
          <tbody>`;
        if (report_cnt_page < total_page) {
            for (var i = 0; i < 3; i++) {
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;' rowspan="${results[page_start].report_cnt}">${results[page_start].id}</td>
                <td style='vertical-align:middle;'>${results[page_start].report_content}</td>
                <td style='vertical-align:middle;'>${results[page_start].time}</td>
                <td style='vertical-align:middle;' rowspan="${results[page_start].report_cnt}">
                  <form action="/admin/out" method="POST">
                    <input type="hidden" name="report_id" value="${results[page_start].id}">
                    <input type="hidden" name="report_cnt_page" value="${report_cnt_page}">
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_out">탈퇴</button>
                  </form>
                </td>
                </tr>`;
                var temp = page_start;
                page_start += 1;
                for (var j = temp + 1; j < temp + results[temp].report_cnt; j++) {
                    table += `<tr id="report_table_tr">
                    <td style='vertical-align:middle;'>${results[j].report_content}</td>
                    <td style='vertical-align:middle;'>${results[j].time}</td>
                    </tr>`;
                    page_start += 1;
                }
            }
        }
        else {
            var last_page = total_reported_id - (total_page - 1) * 3;
            for (var i = 0; i < last_page; i++) {
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;' rowspan="${results[page_start].report_cnt}">${results[page_start].id}</td>
                <td style='vertical-align:middle;'>${results[page_start].report_content}</td>
                <td style='vertical-align:middle;'>${results[page_start].time}</td>
                <td style='vertical-align:middle;' rowspan="${results[page_start].report_cnt}">
                  <form action="/admin/out" method="POST">
                    <input type="hidden" name="report_id" value="${results[page_start].id}">
                    <input type="hidden" name="report_cnt_page" value="${report_cnt_page}">
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn" type="submit" id="btn_out">탈퇴</button>
                  </form>
                </td>
                </tr>`;
                var temp = page_start;
                page_start += 1;
                for (var j = temp + 1; j < temp + results[temp].report_cnt; j++) {
                    table += `<tr id="report_table_tr">
                    <td style='vertical-align:middle;'>${results[j].report_content}</td>
                    <td style='vertical-align:middle;'>${results[j].time}</td>
                    </tr>`;
                    page_start += 1;
                }
            }
        }
        table += `</tbody></table>`;
        return table;
    }, pagination_reportcntlist: function (this_page, total_page) {     // admin.js
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if (total_page <= 5) {
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for (var i = 1; i < this_page; i++) {
                list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/admin/report_cnt/${this_page}">${this_page}</a></li>`;
            for (var i = this_page + 1; i <= total_page; i++) {
                list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else {
            //왼쪽버튼 활성화 여부
            if (this_page <= 3) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if (this_page <= 5) {
                list += `<li><a href="/admin/report_cnt/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else {
                list += `<li><a href="/admin/report_cnt/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if (this_page < 3) {
                for (var i = 1; i < this_page; i++) {
                    list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/report_cnt/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= 5; i++) {
                    list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
                }
            }
            else if (this_page > total_page - 2) {
                for (var i = total_page - 4; i < this_page; i++) {
                    list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/report_cnt/${this_page}">${this_page}</a></li>`;
                for (var i = this_page + 1; i <= total_page; i++) {
                    list += `<li><a href="/admin/report_cnt/${i}">${i}</a></li>`;
                }
            }
            else {
                list += `<li><a href="/admin/report_cnt/${this_page - 2}">${this_page - 2}</a></li>`;
                list += `<li><a href="/admin/report_cnt/${this_page - 1}">${this_page - 1}</a></li>`;
                list += `<li class="active"><a href="/admin/report_cnt/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/admin/report_cnt/${this_page + 1}">${this_page + 1}</a></li>`;
                list += `<li><a href="/admin/report_cnt/${this_page + 2}">${this_page + 2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if (this_page >= total_page - 2) {
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if (this_page >= total_page - 4) {
                list += `<li><a href="/admin/report_cnt/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else {
                list += `<li><a href="/admin/report_cnt/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    }
}