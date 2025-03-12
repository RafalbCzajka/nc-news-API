const db = require("../db/connection");

exports.fetchAllUsers = () => {
    const sqlString = `SELECT username, name, avatar_url FROM users;`;

    return db.query(sqlString).then(({rows}) => {
        return rows;
    })
}