module.exports = {
    isOwner: function (request, response) {
        if (request.session.is_logined) {
            return true;
        } else {
            return false;
        }
    },
    statusUI: function (request, response) {
        var login = `<form action="/auth/login">
        <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
        type="submit" id="login">로그인</button>
        </form>`;
        if (this.isOwner(request, response)) {
            login = `<form action="">
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="login">로그아웃</button>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="login">내 정보</button>
            </form>
            ${request.session.id}`;
            //`${request.session.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return login;
    }
}