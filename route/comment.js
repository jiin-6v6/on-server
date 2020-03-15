var express = require('express');
var router = express.Router();
var qs = require('querystring');
var mysql = require('mysql');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var auth = require('../lib/auth.js');

// mysql connection
var conn;
function handleDisconnect() {
    conn = mysql.createConnection({
        host: 'db.kikijo.gabia.io',
        user: 'kikijo',
        password: 'mintchoco9597',
        database: 'dbkikijo',
        dateStrings: 'date'
    });
    conn.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });
    conn.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            return handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

router.post('/reply/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);
    var parent_id = sanitizeHtml(request.params.commentId);

    var post = request.body;
    var comment_writer = post.comment_writer;
    var comment_content = post.comment_content;

    if (request.user.id !== comment_writer) {
        response.redirect('/');
        return false;
    }

    if (boardId === 'anonymous') {      // 익게인 경우
        var sql = 'SELECT unknown FROM comment WHERE comment_writer=? AND post_id=?';
        conn.query(sql, [comment_writer, postId], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
            if (!results[0]) {    // 한 번도 댓글을 단 적이 없을 때
                var sql = 'SELECT MAX(unknown) AS max FROM comment';
                conn.query(sql, function (error2, results2) {
                    if (error2) {
                        console.log(error2);
                        throw error2;
                    }
                    var unknown = (results2[0].max ? results2[0].max : 0) + 1;
                    var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown, parent_id) VALUES (?, ?, ?, ?, ?, ?)';
                    conn.query(sql, [boardId, postId, comment_writer, comment_content, unknown, parent_id], function (error3, results3) {
                        if (error3) {
                            console.log(error3);
                            throw error3;
                        }
                        // select 해서  comment_id 얻어야 함
                        // 알람에 insert 처리 해야함 (reply이므로 게시글 & parent comment 2개의 알람 생성)
                        // 게시글 작성자와 parent comment 작성자가 동일한 경우 댓글에 대한 알람만 생성
                        var sql = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=?';
                        conn.query(sql, [boardId, postId, comment_writer, comment_content, parent_id], function (error, results) {
                            if (error) {
                                console.log(error);
                                throw error;
                            }
                            if (!results[0]) {
                                console.log('something wrong');
                                response.redirect('/');
                                return false;
                            }
                            var alarming_id = comment_writer;
                            var unknown = results[0].unknown;
                            var comment_id = results[0].id;

                            // parent 댓글에 대한 알람
                            var sql = 'SELECT comment_writer, isDelete FROM comment WHERE id=?';
                            conn.query(sql, [parent_id], function (error4, results4) {
                                if (error4) {
                                    console.log(error4);
                                    throw error4;
                                }
                                if (!results4[0]) {
                                    console.log('something wrong');
                                    response.redirect('/');
                                }
                                if (results4[0].isDelete === 1) {     // 부모댓글이 삭제된 경우 알람을 주지 않는다.
                                    return false;
                                }
                                var alarmed_id = results4[0].comment_writer;

                                if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                                    return false;
                                }

                                var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                                conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, parent_id, unknown], function (error5, results5) {
                                    if (error5) {
                                        console.log(error5);
                                        throw error5;
                                    }
                                });

                                // 게시글에 대한 알람
                                var sql = 'SELECT post_writer FROM post WHERE id=?';
                                conn.query(sql, [postId], function (error2, results2) {
                                    if (error2) {
                                        console.log(error2);
                                        throw error2;
                                    }
                                    if (!results2[0]) {
                                        console.log('something wrong');
                                        response.redirect('/');
                                        return false;
                                    }

                                    if (alarmed_id === results2[0].post_writer) {     // 대댓글에 의한 알람을 받는 2명이 동일인물인 경우
                                        return false;
                                    }

                                    alarmed_id = results2[0].post_writer;

                                    if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                                        return false;
                                    }

                                    var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                                    conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error3, results3) {
                                        if (error3) {
                                            console.log(error3);
                                            throw error3;
                                        }
                                    });
                                });
                            });
                        });
                        response.redirect('/board/' + boardId + '/0/' + postId);
                    });
                });
            }
            else {  // 이미 익명번호를 부여 받은 경우
                var unknown = results[0].unknown;
                var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown, parent_id) VALUES (?, ?, ?, ?, ?, ?)';
                conn.query(sql, [boardId, postId, comment_writer, comment_content, unknown, parent_id], function (error3, results3) {
                    if (error3) {
                        console.log(error3);
                        throw error3;
                    }
                    // select 해서  comment_id 얻어야 함
                    // 알람에 insert 처리 해야함 (reply이므로 게시글 & parent comment 2개의 알람 생성)
                    // 게시글 작성자와 parent comment 작성자가 동일한 경우 댓글에 대한 알람만 생성
                    var sql = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=?';
                    conn.query(sql, [boardId, postId, comment_writer, comment_content, parent_id], function (error, results) {
                        if (error) {
                            console.log(error);
                            throw error;
                        }
                        if (!results[0]) {
                            console.log('something wrong');
                            response.redirect('/');
                            return false;
                        }
                        var alarming_id = comment_writer;
                        var unknown = results[0].unknown;
                        var comment_id = results[0].id;

                        // parent 댓글에 대한 알람
                        var sql = 'SELECT comment_writer, isDelete FROM comment WHERE id=?';
                        conn.query(sql, [parent_id], function (error4, results4) {
                            if (error4) {
                                console.log(error4);
                                throw error4;
                            }
                            if (!results4[0]) {
                                console.log('something wrong');
                                response.redirect('/');
                            }
                            if (results4[0].isDelete === 1) {     // 부모댓글이 삭제된 경우 알람을 주지 않는다.
                                return false;
                            }
                            var alarmed_id = results4[0].comment_writer;

                            if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                                return false;
                            }

                            var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                            conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, parent_id, unknown], function (error5, results5) {
                                if (error5) {
                                    console.log(error5);
                                    throw error5;
                                }
                            });

                            // 게시글에 대한 알람
                            var sql = 'SELECT post_writer FROM post WHERE id=?';
                            conn.query(sql, [postId], function (error2, results2) {
                                if (error2) {
                                    console.log(error2);
                                    throw error2;
                                }
                                if (!results2[0]) {
                                    console.log('something wrong');
                                    response.redirect('/');
                                    return false;
                                }

                                if (alarmed_id === results2[0].post_writer) {     // 대댓글에 의한 알람을 받는 2명이 동일인물인 경우
                                    return false;
                                }

                                alarmed_id = results2[0].post_writer;

                                if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                                    return false;
                                }

                                var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                                conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error3, results3) {
                                    if (error3) {
                                        console.log(error3);
                                        throw error3;
                                    }
                                });
                            });
                        });
                    });
                    response.redirect('/board/' + boardId + '/0/' + postId);
                });
            }
        });
    }
    else {      // 자게 또는 공지사항인 경우
        var sql = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, parent_id) VALUES (?, ?, ?, ?, ?)';
        conn.query(sql, [boardId, postId, comment_writer, comment_content, parent_id], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
            // select 해서  comment_id 얻어야 함
            // 알람에 insert 처리 해야함 (reply이므로 게시글 & parent comment 2개의 알람 생성)
            // 게시글 작성자와 parent comment 작성자가 동일한 경우 댓글에 대한 알람만 생성
            var sql = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=?';
            conn.query(sql, [boardId, postId, comment_writer, comment_content, parent_id], function (error, results) {
                if (error) {
                    console.log(error);
                    throw error;
                }
                if (!results[0]) {
                    console.log('something wrong');
                    response.redirect('/');
                    return false;
                }
                var alarming_id = comment_writer;
                var unknown = results[0].unknown;
                var comment_id = results[0].id;

                // parent 댓글에 대한 알람
                var sql = 'SELECT comment_writer, isDelete FROM comment WHERE id=?';
                conn.query(sql, [parent_id], function (error4, results4) {
                    if (error4) {
                        console.log(error4);
                        throw error4;
                    }
                    if (!results4[0]) {
                        console.log('something wrong');
                        response.redirect('/');
                    }
                    if (results4[0].isDelete === 1) {     // 부모댓글이 삭제된 경우 알람을 주지 않는다.
                        return false;
                    }
                    var alarmed_id = results4[0].comment_writer;

                    if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                        return false;
                    }

                    var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                    conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, parent_id, unknown], function (error5, results5) {
                        if (error5) {
                            console.log(error5);
                            throw error5;
                        }
                    });

                    // 게시글에 대한 알람
                    var sql = 'SELECT post_writer FROM post WHERE id=?';
                    conn.query(sql, [postId], function (error2, results2) {
                        if (error2) {
                            console.log(error2);
                            throw error2;
                        }
                        if (!results2[0]) {
                            console.log('something wrong');
                            response.redirect('/');
                            return false;
                        }

                        if (alarmed_id === results2[0].post_writer) {     // 대댓글에 의한 알람을 받는 2명이 동일인물인 경우
                            return false;
                        }

                        alarmed_id = results2[0].post_writer;

                        if (alarmed_id === alarming_id) {     // 알람 받는 대상 = 알람 주는 대상
                            return false;
                        }

                        var sql = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                        conn.query(sql, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error3, results3) {
                            if (error3) {
                                console.log(error3);
                                throw error3;
                            }
                        });
                    });
                });
            });
            response.redirect('/board/' + boardId + '/0/' + postId);
        });
    }
});



router.post('/:boardId/:postId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);

    var post = request.body;
    var comment_writer = post.comment_writer;
    var comment_content = post.comment_content;

    if (request.user.id !== comment_writer) {       // 작성자와 실제 로그인된 아이디가 다른 경우
        response.redirect('/');
        return false;
    }

    if (boardId === 'anonymous') {      // 익게인 경우
        var sql = 'SELECT unknown FROM comment WHERE comment_writer=? AND post_id=?';
        conn.query(sql, [comment_writer, postId], function (error, results) {
            if (error) {
                console.log(error);
                throw error;
            }
            if (!results[0]) {    // 한 번도 댓글을 단 적이 없을 때
                var sql2 = 'SELECT MAX(unknown) AS max FROM comment WHERE post_id=?';
                conn.query(sql2, [postId], function (error2, results2) {
                    if (error2) {
                        console.log(error2);
                        throw error2;
                    }
                    var unknown = (results2[0].max ? results2[0].max : 0) + 1;
                    var sql3 = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?, ?)';
                    conn.query(sql3, [boardId, postId, comment_writer, comment_content, unknown], function (error3, results3) {
                        if (error3) {
                            console.log(error3);
                            throw error3;
                        }
                        var sql5 = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=0 ORDER BY id DESC';
                        conn.query(sql5, [boardId, postId, comment_writer, comment_content], function (error5, results5) {
                            if (error5) {
                                console.log(error5);
                                throw error5;
                            }
                            console.log(results5);
                            if (!results5[0]) {
                                console.log('something wrong1');
                                response.redirect('/');
                                return false;
                            }
                            var alarming_id = comment_writer;
                            var unknown = results5[0].unknown;
                            var comment_id = results5[0].id;

                            // 게시글에 대한 알람
                            var sql6 = 'SELECT post_writer FROM post WHERE id=?';
                            conn.query(sql6, [postId], function (error6, results6) {
                                if (error6) {
                                    console.log(error6);
                                    throw error6;
                                }

                                if (!results6[0]) {
                                    console.log('something wrong2');
                                    response.redirect('/');
                                    return false;
                                }
                                var alarmed_id = results6[0].post_writer;

                                if (alarmed_id !== alarming_id) {     // 알람 받는 대상 != 알람 주는 대상
                                    var sql7 = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                                    conn.query(sql7, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error7, results7) {
                                        if (error7) {
                                            console.log(error7);
                                            throw error7;
                                        }
                                    });
                                }
                                response.redirect('/board/' + boardId + '/0/' + postId);
                            });
                        });
                    });
                });
            }
            else {  // 이미 익명번호를 부여 받은 경우
                var unknown = results[0].unknown;
                var sql3 = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content, unknown) VALUES (?, ?, ?, ?, ?)';
                conn.query(sql3, [boardId, postId, comment_writer, comment_content, unknown], function (error3, results3) {
                    if (error3) {
                        console.log(error3);
                        throw error3;
                    }
                    var sql5 = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=0 ORDER BY id DESC';
                    conn.query(sql5, [boardId, postId, comment_writer, comment_content], function (error5, results5) {
                        if (error5) {
                            console.log(error5);
                            throw error5;
                        }
                        console.log(results5);
                        if (!results5[0]) {
                            console.log('something wrong1');
                            response.redirect('/');
                            return false;
                        }
                        var alarming_id = comment_writer;
                        var unknown = results5[0].unknown;
                        var comment_id = results5[0].id;

                        // 게시글에 대한 알람
                        var sql6 = 'SELECT post_writer FROM post WHERE id=?';
                        conn.query(sql6, [postId], function (error6, results6) {
                            if (error6) {
                                console.log(error6);
                                throw error6;
                            }

                            if (!results6[0]) {
                                console.log('something wrong2');
                                response.redirect('/');
                                return false;
                            }
                            var alarmed_id = results6[0].post_writer;

                            if (alarmed_id !== alarming_id) {     // 알람 받는 대상 != 알람 주는 대상
                                var sql7 = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                                conn.query(sql7, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error7, results7) {
                                    if (error7) {
                                        console.log(error7);
                                        throw error7;
                                    }
                                });
                            }
                            response.redirect('/board/' + boardId + '/0/' + postId);
                        });
                    });
                });
            }
        });
    }
    else {      // 자게 또는 공지사항인 경우
        var sql4 = 'INSERT INTO comment (board_id, post_id, comment_writer, comment_content) VALUES (?, ?, ?, ?)';
        conn.query(sql4, [boardId, postId, comment_writer, comment_content], function (error4, results4) {
            if (error4) {
                console.log(error4);
                throw error4;
            }
            var sql5 = 'SELECT id, unknown FROM comment WHERE board_id=? AND post_id=? AND comment_writer=? AND comment_content=? AND parent_id=0 ORDER BY id DESC';
            conn.query(sql5, [boardId, postId, comment_writer, comment_content], function (error5, results5) {
                if (error5) {
                    console.log(error5);
                    throw error5;
                }
                console.log(results5);
                if (!results5[0]) {
                    console.log('something wrong1');
                    response.redirect('/');
                    return false;
                }
                var alarming_id = comment_writer;
                var unknown = results5[0].unknown;
                var comment_id = results5[0].id;

                // 게시글에 대한 알람
                var sql6 = 'SELECT post_writer FROM post WHERE id=?';
                conn.query(sql6, [postId], function (error6, results6) {
                    if (error6) {
                        console.log(error6);
                        throw error6;
                    }

                    if (!results6[0]) {
                        console.log('something wrong2');
                        response.redirect('/');
                        return false;
                    }
                    var alarmed_id = results6[0].post_writer;

                    if (alarmed_id !== alarming_id) {     // 알람 받는 대상 != 알람 주는 대상
                        var sql7 = 'INSERT INTO alarm (comment_id, alarmed_id, alarming_id, post_id, board_id, parent_id, unknown) VALUES (?, ?, ?, ?, ?, ?, ?)';
                        conn.query(sql7, [comment_id, alarmed_id, alarming_id, postId, boardId, 0, unknown], function (error7, results7) {
                            if (error7) {
                                console.log(error7);
                                throw error7;
                            }
                        });
                    }
                    response.redirect('/board/' + boardId + '/0/' + postId);
                });
            });
        });
    }

    // select 해서  comment_id 얻어야 함
    // 알람에 insert 처리 해야함 (게시글에 대한 알람 1개만 생성)
});

router.get('/update/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }

    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);
    var commentId = Number(sanitizeHtml(request.params.commentId));

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var title = '';
    var nav = `<nav>
        <h2>게시판</h2>
        <p id="side-list"><a href="/board/notice/1">공지사항</a></p>
        <p id="side-list"><a href="/board/free/1">자유게시판</a></p>
        <p id="side-list"><a href="/board/anonymous/1">익명게시판</a></p>
        </nav>`;
    var login = auth.statusUI(request, response);

    var sql = 'SELECT * FROM post WHERE board_id=? AND id=?';
    conn.query(sql, [boardId, postId], function (error, results) {
        if (error) {
            throw error;
        }

        if (!results[0]) {
            wrongPath = true;
            response.redirect('/board/' + boardId);
            return false;
        }

        var content = template.look_post(request, results);

        var sql = 'SELECT * FROM comment WHERE post_id=? ORDER BY time DESC';
        conn.query(sql, [postId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                throw error2;
            }
            content += template.comment_list_update(request, results2, boardId, postId, commentId, false);

            var html = template.basic(title, login, nav, content);
            response.send(html);
        });
    });
});

router.post('/update_process/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = Number(sanitizeHtml(request.params.postId));
    var commentId = Number(sanitizeHtml(request.params.commentId));

    var post = request.body;
    var comment_content = post.comment_content;

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM comment WHERE id=?';
    conn.query(sql, [commentId], function (error, results) {
        if (error) {
            throw error;
        }
        if (!results[0]) {  // 존재하지 않는 댓글
            wrongPath = true;
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }
        if (results[0].comment_writer !== request.user.id) { // 작성자가 아닌 경우
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }
        if (results[0].post_id !== postId) {  // db에 저장되어 있는 댓글의 게시글 위치와 다른 경우
            console.log('something wrong!');
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false;
        }

        var sql = 'UPDATE comment SET comment_content=?, time=CURRENT_TIMESTAMP, isUpdate=1 WHERE id=?';
        conn.query(sql, [comment_content, commentId], function (error2, results2) {
            if (error2) {
                console.log(error2);
                response.status(500).send('Internal Server Error');
            }
            else {
                response.redirect('/board/' + boardId + '/0/' + postId);
            }
        });
    });
});

router.get('/delete/:boardId/:postId/:commentId', function (request, response) {
    if (!auth.isLogin(request, response)) {
        response.redirect('/');
        return false;
    }
    var boardId = sanitizeHtml(request.params.boardId);
    var postId = sanitizeHtml(request.params.postId);
    var commentId = sanitizeHtml(request.params.commentId);

    if (boardId != 'notice' && boardId != 'free' && boardId != 'anonymous') {
        wrongPath = true;
        response.redirect('/');
        return false;
    }

    var sql = 'SELECT * FROM comment WHERE id=?';
    conn.query(sql, [commentId], function (error, results) {
        if (error) {
            console.log(error);
            throw error;
        }
        if (!results[0]) {    // 존재하지 않는 댓글을 지우려고 했을 때
            response.redirect('/board/' + boardId + '/0/' + postId);
            return false
        }
        if ((request.user.id !== results[0].comment_writer) && !request.user.isAdmin) {    // 작성자도 아니고 관리자도 아닌 경우
            console.log('something wrong');
            response.redirect('/');
            return false;
        }
        if (request.user.isAdmin && results[0].isDelete !== 2) { // admin mode
            var sql = 'UPDATE user_info SET report_cnt = report_cnt + 1 WHERE id=?';
            conn.query(sql, [results[0].comment_writer], function (error2, results2) {
                if (error2) {
                    console.log(error2);
                    response.status(500).send('Internal Server Error');
                }
                else {       // report page num 어떻게 넘길 것인가..
                    // response.redirect('/admin/1');
                }
            });
            var sql = 'UPDATE report SET state=1 WHERE comment_id=? AND post_id=?';
            conn.query(sql, [commentId, postId], function (error3, results3) {
                if (error3) {
                    console.log(error3);
                    response.status(500).send('Internal Server Error');
                }
                else {
                    // 지인아 여기는 뭘까?
                }
            });
            var sql = 'UPDATE comment SET isDelete=2 WHERE id=?';
            conn.query(sql, [commentId], function (error4, results4) {
                if (error4) {
                    console.log(error4);
                    throw error4;
                }
            });
        }
        else {   // user mode
            var sql = 'UPDATE comment SET isDelete=1 WHERE id=?';
            conn.query(sql, [commentId], function (error4, results4) {
                if (error4) {
                    console.log(error4);
                    throw error4;
                }
            });
        }

        // alarm DB 수정
        var sql = 'UPDATE alarm SET isCheck=1 WHERE comment_id=?';
        conn.query(sql, [commentId], function (error5, results5) {
            if (error5) {
                console.log(error5);
                throw error5;
            }
            else {
                if (request.user.isAdmin) {   // report page number 어떻게 처리할 것인가..
                    response.redirect('/admin/1');
                    return true;
                }
                response.redirect('/board/' + boardId + '/0/' + postId);
            }
        });
    });
});

module.exports = router;