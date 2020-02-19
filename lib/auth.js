module.exports = {
    isOwner: function (request, response) {
        if (request.user) {
            return true;
        } else {
            return false;
        }
    },
    statusUI: function (request, response) {
        var login = `<form action="/auth/login">
        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
        type="submit" id="btn_login">로그인</button>
        </form>`;
        if (this.isOwner(request, response)) {
            console.log('들어오니?');
            login = `<form>
            <div id="user_id">${request.user}</div>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="btn_logout" formaction="/auth/logout">로그아웃</button>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="btn_my_info" formaction="/my_info">내 정보</button>
            </form>
            
            `;
            //`${request.session.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return login;
    }
}