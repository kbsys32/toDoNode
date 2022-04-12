module.exports = {
    HTML: function (title, list, body, control) {
        return `
    <!doctype html>
    <html lang="">
    <head>
      <title>toDo - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">toDoList</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html
    `;
    }, list: function (toDos) {
        var list = '<ul>';
        var i = 0;
        while (i < toDos.length) {
            list = list + `<li><a href="/?id=${toDos[i].id}">${toDos[i].title}</a></li>`;
            i = i + 1;
        }
        list = list + '</ul>';
        return list;
    }, importanceSelect: function (importances,importance) {
        var tag = '';
        var i = 0;
        while ( i < importances.length) {
            var selected = '';
            if(importances[i].id === importance){
                selected = 'selected';
            }
            tag = tag + `<option value="${importances[i].id}"${selected}>${importances[i].grade}</option>`;
            i++;
        }
        return `<select name="importance">${tag}</select>`
    }
}
