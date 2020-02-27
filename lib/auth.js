module.exports = {
    isLogin: function(request, response){
        if(request.user){
            return true;
        }
        return false;
    },statusUI: function (request, response) {
        var login = `<form action="/auth/login">
        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
        type="submit" id="btn_login">로그인</button>
        </form>`;
        if(request.user){
            login = `<form>
            <div id="user_id">${request.user.id}</div>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="btn_logout" formaction="/auth/logout">로그아웃</button>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="btn_my_info" formaction="/my_info">내 정보</button>
            </form>
            `;
            if(request.baseUrl === "/my_info"){
                login = `<form>
                    <div id="user_id">${request.user.id}</div>
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                    type="submit" id="btn_logout" formaction="/auth/logout">로그아웃</button>
                    <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                    type="submit" id="btn_admin" formaction="/board/notice/1">게시판</button>
                    </form>
                    `;
            }
            if(request.user.isAdmin){
                login = `<form>
                <div id="user_id">${request.user.id}</div>
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                type="submit" id="btn_logout" formaction="/auth/logout">로그아웃</button>
                <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                type="submit" id="btn_admin" formaction="/admin/1">관리자</button>
                </form>
                `;
                if(request.baseUrl === "/admin"){
                    login = `<form>
                        <div id="user_id">${request.user.id}</div>
                        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                        type="submit" id="btn_logout" formaction="/auth/logout">로그아웃</button>
                        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
                        type="submit" id="btn_admin" formaction="/board/notice/1">게시판</button>
                        </form>
                        `;
                }
                
            }
        }
        return login;
    }
}