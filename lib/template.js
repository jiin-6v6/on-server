module.exports = {
    basic:function(title, login, nav, content){
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
                    <div id="content">
                        ${content}
                    </div>
                
                    ${nav}
                    
                </main>
          
                <footer>
                    <div class="container"></div>
                </footer>
                <script src="https://use.fontawesome.com/releases/v5.12.1/js/all.js"></script>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>        
            </body>
        </html>
        `;
    },list:function(filelist){
        var list = '<ul>';
        var i = 0;
        while(i < filelist.length){
            list = list + `<li><a href="/topic/${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list+'</ul>';
        return list;
    },postlist:function(results, boardId){
        var table = `<div class='table-responsive'>
        <table class='table table-nomargin'>
            <thead>
            <tr><th style='min-width:40px' class='mobile-hide'>번호</th><th style='width:60%; padding-left:12px !important;'>제목</th><th style='min-width:80px;text-align:center;'>이름</th><th style='width:15%;text-align:center;'>날짜</th></tr>
            </thead>
            <tbody>`;
        for(var i=0; i<results.length; i++){
            table +=`<a href='/board/${boardId}/${results[i].id}'>
            <tr onmouseover="this.style.backgroundColor='#F3F6F4'" onmouseout="this.style.backgroundColor=''">
            <td class='mobile-hide' style = 'font-size : 11px;'><center>${results[i].id}</center></td>
            <td class='title title-align'><span class="">${results[i].post_title}</span></td>
            <td style='text-align:center;'>${results[i].post_writer}</td>
            <td style='text-align:center;'>${results[i].time}</td></tr></a>`;
        }
        table += `</tbody></table></div>`;
        return table;
    }
}