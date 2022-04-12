const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql');
const db = mysql.createConnection({
    host: '180.71.58.81', user: 'kbsus32', password: '1234', database: 'kbsus32',
});

db.connect();

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {
            db.query(`SELECT *
                      FROM toDo`, function (error, toDos) {
                console.log(toDos);
                var title = 'toDo Test with Node.js';
                var description = '김유진';
                var list = template.list(toDos);
                var html = template.HTML(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">추가</a>`);
                response.writeHead(200);
                response.end(html);
            });

        } else {

            db.query(`SELECT *
                      FROM toDo`, function (error, toDos) {
                if (error) {
                    throw error;
                }
                db.query(`SELECT *
                          FROM toDo
                                   LEFT JOIN importance ON toDo.importance = importance.id
                          WHERE toDo.id = ?`, [queryData.id], function (error2, toDo) {
                    if (error2) {
                        throw error2;
                    }

                    console.log(toDo);
                    var title = toDo[0].title;
                    var description = toDo[0].description;
                    var list = template.list(toDos);
                    var html = template.HTML(title, list, `<h2>${title}</h2>${description} <br> importance : ${toDo[0].grade}`, ` <a href="/create">추가</a>
                <a href="/update?id=${queryData.id}">수정</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${queryData.id}">
                  <input type="submit" value="과제 완료">
                </form>`);
                    response.writeHead(200);
                    response.end(html);

                })

            });
        }
    } else if (pathname === '/create') {
        db.query(`SELECT *
                  FROM toDo`, function (error, toDos) {
            db.query(`SELECT *
                      FROM importance`, function (error2, importance) {
                console.log(importance);
                var title = 'Create';
                var list = template.list(toDos);
                var html = template.HTML(title, list, `  <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
            ${template.importanceSelect(importance)}
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`, `<a href="/create">추가</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });


    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query(`INSERT INTO toDo (title, description, created, importance)
                      VALUES (?, ?, NOW(), ?)`, [post.title, post.description, post.importance], function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`});
                response.end();
            })
        });
    } else if (pathname === '/update') {
        db.query(`SELECT *
                  FROM todo`, function (error, toDos) {
            if (error) {
                throw error;
            }
            db.query(`SELECT *
                      FROM toDo
                      WHERE id = ?`, (queryData.id), function (error2, toDo) {
                if (error2) {
                    throw error2;
                }
                db.query(`SELECT *
                      FROM importance`, function (error2, importances){
                    var list = template.list(toDos);
                    var html = template.HTML(toDo[0].title, list, `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${toDo[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${toDo[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${toDo[0].description}</textarea>
              </p>
              <p>
              ${template.importanceSelect(importances, toDo[0].importance)}
</p>
              <p>
                <input type="submit">
              </p>
            </form>
            `, `<a href="/create">추가</a> <a href="/update?id=${toDo[0].id}">수정</a>`);
                    response.writeHead(200);
                    response.end(html);

                });
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query(`UPDATE toDo
                      SET title=?,
                          description=?,
                          importance=?
                      WHERE id = ?`, [post.title, post.description, post.importance ,post.id], function (error, result) {
                response.writeHead(302, {Location: `/?id=${post.id}`});
                response.end();
            })
        });
    } else if (pathname === '/delete_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            db.query(`DELETE
                      FROM toDo
                      WHERE id = ?`, [post.id], function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, {Location: '/'});
                response.end();
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3001);
