'use strict';

const sqlite3 = require('sqlite3').verbose();

const controller = {}

controller.initUserTable = function () {
    const db = new sqlite3.Database('PostalDatabase.db');

    db.serialize( () => {
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, token TEXT NOT NULL )");
    });

    db.close()

    console.log("Database Users init step...")
}

controller.addUser = function (userName, userToken, callback) {
    const db = new sqlite3.Database('PostalDatabase.db');

    db.get(`SELECT username FROM users WHERE username='${userName}'`, (err, row) => {

        if (err) { console.error(err.message); }

        if (row?.username) {
            db.close()
            callback('exists')
        } else {
            db.run(`INSERT INTO users (username, token) VALUES ('${userName}', '${userToken}')`, (result, err) => {
                if (err) {
                    console.error(err.message);
                    db.close()
                    callback('error')
                } else {
                    console.log('insert DB result = ' + result)
                    callback('success')
                }
            });
        }
    });
}

controller.getUserToken = function (userName, callback) {
    const db = new sqlite3.Database('PostalDatabase.db');

    db.get(`SELECT token FROM users WHERE username="${userName}"`, (err, row) => {
        db.close()
        let token = ''
        if (err) { console.error(err.message); }
        if (!row?.token) {
            console.log("Пользователь не найден в базе!")
            callback("")
        } else {
            callback(row.token)
        }
    });
}


module.exports = controller