var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '180.71.58.81',
    user: 'kbsys32',
    password: '1234',
    database: 'kbsus32',
});

connection.connect();

connection.query('SELECT * FROM toDo',function(error,results,fields)
{
    if(error) {
        console.log(error);
    }
    console.log(results)
});
connection.end();