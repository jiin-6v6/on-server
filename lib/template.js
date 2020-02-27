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
    }, list: function (filelist) {
        var list = '<ul>';
        var i = 0;
        while (i < filelist.length) {
            list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + '</ul>';
        return list;
    }, postlist: function (results, boardId, this_page) {
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'>번호</th><th style='width:60%; padding-left:12px !important;'>제목</th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            table += `
            <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
            <td class='mobile-hide' style = 'font-size : 11px;'><center>${results[i].id}</center></td>
            <td class='title title-align'><span class="">
            <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
            <td style='text-align:center;'>${results[i].post_writer}</td>
            <td style='text-align:center;'>${results[i].time}</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, postlist_mypost: function (results, this_page) {
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'>번호</th><th style='width:60%; padding-left:12px !important;'>제목</th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            table += `
            <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
            <td class='mobile-hide' style = 'font-size : 11px;'><center>${results[i].id}</center></td>
            <td class='title title-align'><span class="">
            <a href="/board/${results[i].board_id}/0/${results[i].id}">${results[i].post_title}</a></span></td>
            <td style='text-align:center;'>${results[i].post_writer}</td>
            <td style='text-align:center;'>${results[i].time}</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, postlist_anony: function (results, boardId, this_page) {
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'>번호</th><th style='width:60%; padding-left:12px !important;'>제목</th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = results.length - (this_page * 10) + 9; i >= results.length - (this_page * 10) && i >= 0; i--) {
            table += `
            <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
            <td class='mobile-hide' style = 'font-size : 11px;'><center>${results[i].id}</center></td>
            <td class='title title-align'><span class="">
            <a href="/board/${boardId}/0/${results[i].id}">${results[i].post_title}</a></span></td>
            <td style='text-align:center;'>익명</td>
            <td style='text-align:center;'>${results[i].time}</td></tr>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }, myinfo: function (results) {
        //잘 출력되는지 확인 후 birth parsing(1997년 2월 18일 이런 형태로 출력하게)
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
    }, post_write_update: function (request, response, postId, results) {
        var notice = '';
        if (request.user.isAdmin) {
            notice = `<option value="notice">공지사항</option>`;
        }

        // for write post
        if (!results) {  // update가 아닌 경우 results===null
            var content = `
                <div id="content">
                    <form action="/board/write_process" method="POST">
                        <select name="category">
                            <option value="" selected="true" disabled="disabled">카테고리 선택</option>
                            ${notice}
                            <option value="free">자유게시판</option>
                            <option value="anonymous">익명게시판</option>
                        </select>
                        <input type="text" id="post_title" name="post_title" placeholder="제목을 입력하세요.">
                        <br><br>
                        <textarea id="post_content" name="post_content" placeholder="내용을 입력하세요."></textarea>
                        <br><br>
                        <input type="file" name="post_file">
                        <br>
                        <input type="submit" id="to_post" style="position: absolute; right: 130px;">
                    </form>
                </div>`;
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
                    <select name="category">
                        <option value="" selected="true" disabled="disabled">카테고리 선택</option>
                        ${notice}
                        <option value="free">자유게시판</option>
                        <option value="anonymous">익명게시판</option>
                    </select>
                    <input type="text" id="post_title" name="post_title" placeholder="제목을 입력하세요." value="${results[0].post_title}">
                    <br><br>
                    <textarea id="post_content" name="post_content" placeholder="내용을 입력하세요.">${results[0].post_content}</textarea>
                    <br><br>
                    <input type="file" name="post_file">
                    <br>
                    <input type="submit" name="to_post" style="position: absolute; right: 130px;">
                </form>
            </div>`;
            return content;
        }
        else {   // results!=null but postId==null인 경우
            return false;
        }
    }, reportlist: function (results, report_page, total_page) {
        var table = `<div id="content">
        <h2 style='text-align:left;'>신고</h2>
        <table class="table" id="report_table">
          <thead>
            <tr id="report_table_tr">
              <th style='width:15%; text-align:center;'>카테고리</th>
              <th style='width:70%; text-align:center;'>추가설명</th>
              <th style='width:15%; text-align:center;'></th>
            </tr>
          </thead>
          <tbody>`;
        if (report_page < total_page) {
            for (var i = 5 * (report_page - 1); i < 5 * (report_page - 1) + 5; i++) {
                var category = '';
                if (results[i].category == 1) {
                    category = '욕설';
                }
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${category}</td>
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
                var category = '';
                if (results[i].category == 1) {
                    category = '욕설';
                }
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${category}</td>
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
    }, pagination_reportlist: function (this_page, total_page) {
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
    }, reportcntlist: function (results, report_cnt_page, total_page, total_reported_id) {
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
    }, pagination_reportcntlist: function (this_page, total_page) {
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
    }, pagination_board: function (boardId, this_page, total_page) {
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
                list += `<li class="active"><a href="/board/${board}/${this_page}">${this_page}</a></li>`;
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
    }, pagination_mypost: function (this_page, total_page) {
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
                list += `<li class="active"><a href="/board/${board}/${this_page}">${this_page}</a></li>`;
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
    }, update: function (post) {
        return `
        <div id="content">
        <h3 style='text-align: left; padding:20px 0 0 30px; margin:0;'>내 정보</h3><hr>
        <form id="update_process" method="post">
          <ul id = "regist_list">
            <li style="position:relative;">
                <strong>아이디&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="text" name="auth_id" value="${post.user_id}" placeholder="ID">
                <button type="submit" formaction="check_id" class="regist_btn_a">중복확인</button>
            </li>
            <li>
                <strong>비밀번호&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
                <input class="input_box" type="password" name="auth_pwd" placeholder="PASSWORD">
            </li>
            <li>
                <strong>비밀번호 확인&nbsp : &nbsp</strong>
                <input class="input_box" type="password" name="auth_pwd_check" placeholder="PASSWORD 확인">
            </li>
            <li>
              <strong>생년월일&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp : &nbsp</strong>
              <input class="input_box" type="text" name="auth_birth" value="${post.user_birth}" placeholder="ex)1995-05-15" maxlength="10">
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
        `
    }, alarm: function (results) {
        var content = `<div id="content">
        <div id="alarm_list">`
        for (var i = 0; i < results.length; i++) {
            content += `${results[i].alarming_id}님이 `;
            if (results[i].comment_id == 0) {
                content += `댓글에서 회원님을 언급했습니다.`;
            }
            else {
                content += `게시글에 댓글을 달았습니다.`;
            }
            content += `<a href="/board/${results[i].board_id}/${results[i].post_id}" id="alarm_view">보기</a>
                <a href="" id="alarm_delete">삭제</a>`;
            if (i != results.length - 1) {
                content += `<br><br>`;
            }
        }
        content += `</div></div>`;
        return content;
    }, look_post: function (request, results) {
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
        else {   // 새창 띄우기를 하고 싶은건데 아직 어떻게 하는건지 모르겠음!
            button = `<div id="report" style="text-align: right;">
                <form action="" method="POST">
                    <input type="submit" id="post_rewrite" value="신고하기">
                </form>
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
    }, comment: function (request, results, boardId, postId) {
        if (!results) {     // results === null
            return false;
        }

        if (!results[0]) {    // results === [] 
            var comment = `댓글이 존재하지 않습니다.`;
            var content = `<div id="comments">
                    <form action="/comment/${boardId}/${postId}" method="POST">
                        <input type="hidden" name="comment_writer" value="${request.user.id}">
                        <input type="textarea" id="comment_content" name="comment_content" style="width: 600px; height: 70px;">
                        <input type="submit" id="comment" value="댓글달기">
                    </form>
                    <br>
                        ${comment}
                </div>            
                </div>
            </div>`;
        return content;
        }
        
        var comment = ``;
        var array = [];

        if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
            wrongPath = true;
            return false;
        }

        if (boardId === 'anonymous') {      // 익게인 경우
            array.push(`<table class="table" id="comment_${results[0].post_id}">
            <thead>
                <tr id="comment_table_tr">
                    <th>댓글</th>
                </tr>
            </thead>
            <tbody>`);
            for (var i = 0; i < results.length; i++) {
                var isUpdate = ``;
                if (results[i].isUpdate === 1) {
                    isUpdate = `(수정됨)`;
                }
                if (results[i].parent_id === 0) {
                    array.splice(1, 0, `<tr id="${results[i].id}_info">
                            <th style = 'width:70%; text-align:left;'>익명 ${results[i].unknown}</th>
                            <th style = 'width:30%; text-align:center;'>${results[i].time}${isUpdate}</th>
                        </tr>
                        <tr id="${results[i].id}_content">
                            <th style = 'text-align:left;'>${results[i].comment_content}</th>
                        </tr>`);
                }
                else {
                    var index = array.findIndex(element => element.includes(`div id="${results[i].parent_id}"`));
                    array.splice(index, 0, `<tr id="${results[i].id}_info">
                            <th style = 'width:10%; text-align:center;'>↳</th>
                            <th style = 'width:60%; text-align:left;'>익명 ${results[i].unknown}</th>
                            <th style = 'width:30%; text-align:center;'>${results[i].time}${isUpdate}</th>
                        </tr>
                        <tr id="${results[i].id}_content">
                            <th style = 'width:10%; text-align:center;'></th>
                            <th style = 'width:90%; text-align:left;'>${results[i].comment_content}</th>
                        </tr>`);
                }
            }
            array.push(`</tbody></table>`);
            comment = array.join('');
        }
        else {
            array.push(`<table class="table" id="comment_${results[0].post_id}">
            <thead>
                <tr id="comment_table_tr">
                    <th>댓글</th>
                </tr>
            </thead>
            <tbody>`);
            for (var i = 0; i < results.length; i++) {
                var isUpdate = ``;
                if (results[i].isUpdate === 1) {
                    isUpdate = `(수정됨)`;
                }
                if (results[i].parent_id === 0) {
                    array.splice(1, 0, `<tr id="${results[i].id}_info">
                            <th style = 'width:70%; text-align:left;'>${results[i].comment_writer}</th>
                            <th style = 'width:30%; text-align:center;'>${results[i].time}${isUpdate}</th>
                        </tr>
                        <tr id="${results[i].id}_content">
                            <th style = 'text-align:left;'>${results[i].comment_content}</th>
                        </tr>`);
                }
                else {
                    var index = array.findIndex(element => element.includes(`div id="${results[i].parent_id}"`));
                    array.splice(index, 0, `<tr id="${results[i].id}_info">
                            <th style = 'width:10%; text-align:center;'>↳</th>
                            <th style = 'width:60%; text-align:left;'>${results[i].comment_writer}</th>
                            <th style = 'width:30%; text-align:center;'>${results[i].time}${isUpdate}</th>
                        </tr>
                        <tr id="${results[i].id}_content">
                            <th style = 'width:10%; text-align:center;'></th>
                            <th style = 'width:90%; text-align:left;'>${results[i].comment_content}</th>
                        </tr>`);
                }
            }
            array.push(`</tbody></table>`);
            comment = array.join('');
        }

        var content = `<div id="comments">
                    <form action="/comment/${boardId}/${postId}" method="POST">
                        <input type="hidden" name="comment_writer" value="${request.user.id}">
                        <input type="textarea" id="comment_content" name="comment_content" style="width: 600px; height: 70px;">
                        <input type="submit" id="comment" value="댓글달기">
                    </form>
                    <br>
                        ${comment}
                </div>            
                </div>
            </div>`;
        return content;
    }
}