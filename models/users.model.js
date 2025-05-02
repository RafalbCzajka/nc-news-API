const db = require("../db/connection");

exports.fetchAllUsers = () => {
    const sqlString = `SELECT username, name, avatar_url FROM users;`;

    return db.query(sqlString).then(({rows}) => {
        return rows;
    })
}

exports.fetchUserByUsername = (username) => {
    const sqlString = `SELECT username, name, avatar_url FROM users WHERE username = $1;`;
    return db.query(sqlString, [username]).then(({rows}) => {
        return rows[0];
    })
}