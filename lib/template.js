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
    }, postlist: function (results, boardId) {
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'>번호</th><th style='width:60%; padding-left:12px !important;'>제목</th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for (var i = 0; i < results.length; i++) {
            table += `
            <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
            <td class='mobile-hide' style = 'font-size : 11px;'><center>${results[i].id}</center></td>
            <td class='title title-align'><span class="">
            <a href="/board/${boardId}/${results[i].id}">${results[i].post_title}</a></span></td>
            <td style='text-align:center;'>${results[i].post_writer}</td>
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
            notice = `<option value="0">공지사항</option>`;
        }

        // for write post
        if (!results) {  // update가 아닌 경우 results===null
            var content = `
                <div id="content">
                    <form action="/board/write_process" method="POST">
                        <select name="category">
                            <option value="" selected="true" disabled="disabled">카테고리 선택</option>
                            ${notice}
                            <option value="1">자유게시판</option>
                            <option value="2">익명게시판</option>
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
                        <option value="1">자유게시판</option>
                        <option value="2">익명게시판</option>
                    </select>
                    <input type="text" id="post_title" name="post_title" placeholder="제목을 입력하세요." value="${results[0].post_title}">
                    <br><br>
                    <textarea id="post_content" name="post_content" placeholder="내용을 입력하세요.">${results[0].content}</textarea>
                    <br><br>
                    <input type="file" name="post_file">
                    <br>
                    <input type="submit" name="to_post" style="position: absolute; right: 130px;">
                </form>
            </div>`;
            return content;
        }
        else{   // results!=null but postId==null인 경우
            return false;
        }
    },reportlist:function(results, report_page, total_page){
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
        if(report_page < total_page){
            for(var i=5*(report_page-1); i<5*(report_page-1)+5; i++){
                var category = '';
                if(results[i].category == 1){
                    category = '욕설';
                }
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${category}</td>
                <td style='vertical-align:middle;'><a href="/board/${results[i].board_id}/${results[i].post_id}">${results[i].content}</a></td>
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
        else{
            for(var i=5*(report_page-1); i<results.length; i++){
                var category = '';
                if(results[i].category == 1){
                    category = '욕설';
                }
                table += `<tr id="report_table_tr">
                <td style='vertical-align:middle;'>${category}</td>
                <td style='vertical-align:middle;'><a href="/board/${results[i].board_id}/${results[i].post_id}">${results[i].content}</a></td>
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
    },pagination:function(this_page, total_page){
        var list = `<div class="text-center">
        <ul class="pagination">`;
        if(total_page <= 5){
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            for(var i=1; i<this_page; i++){
                list += `<li><a href="/admin/${i}">${i}</a></li>`;
            }
            list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
            for(var i=this_page + 1; i<=total_page; i++){
                list += `<li><a href="/admin/${i}">${i}</a></li>`;
            }
            list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
        }
        else{
            //왼쪽버튼 활성화 여부
            if(this_page <= 3){
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else if(this_page <= 5){
                list += `<li><a href="/admin/1"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            else{
                list += `<li><a href="/admin/${this_page - 5}"><span class="glyphicon glyphicon-chevron-left"></span></a></li>`;
            }
            //page
            if(this_page < 3){
                for(var i=1; i<this_page; i++){
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                for(var i=this_page + 1; i<=5; i++){
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
            }
            else if(this_page > total_page - 2){
                for(var i=total_page - 4; i<this_page; i++){
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                for(var i=this_page + 1; i<=total_page; i++){
                    list += `<li><a href="/admin/${i}">${i}</a></li>`;
                }
            }
            else{
                list += `<li><a href="/admin/${this_page-2}">${this_page-2}</a></li>`;
                list += `<li><a href="/admin/${this_page-1}">${this_page-1}</a></li>`;
                list += `<li class="active"><a href="/admin/${this_page}">${this_page}</a></li>`;
                list += `<li><a href="/admin/${this_page+1}">${this_page+1}</a></li>`;
                list += `<li><a href="/admin/${this_page+2}">${this_page+2}</a></li>`;
            }
            //오른쪽버튼 활성화 여부
            if(this_page >= total_page - 2){
                list += `<li class="disabled"><a href=""><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else if(this_page >= total_page - 4){
                list += `<li><a href="/admin/${total_page}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
            else{
                list += `<li><a href="/admin/${this_page + 5}"><span class="glyphicon glyphicon-chevron-right"></span></a></li>`;
            }
        }
        list += `</ul></div></div>`;
        return list;
    },update:function(post){
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
    }
}