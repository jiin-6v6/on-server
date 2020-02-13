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
        type="submit" id="login">로그인</button>
        </form>`;
        if (this.isOwner(request, response)) {
            login = `<form>
            <div id="user_id">${request.user.id}</div>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="logout" formaction="/auth/logout">로그아웃</button>
            <button onmouseover="this.style.color='#cccccc'" onmouseout="this.style.color=''" class="btn"
            type="submit" id="my_info" formaction="/auth/my_info">내 정보</button>
            </form>
            
            `;
            //`${request.session.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return login;
    }
}