const db = require("../db/connection");
const {checkExists} = require("../db/seeds/utils");

exports.fetchCommentsByArticleId = (id) => {
    return checkExists('articles', 'article_id', id).then((exists) => {
        if (!exists) {
            return Promise.reject({status: 404, msg: "article_id not found"});
        }
        return db.query(`SELECT comment_id, votes, created_at, author, body, article_id FROM comments
            WHERE article_id = $1
            ORDER BY created_at DESC`, [id])
        .then(({rows}) => {
            return rows;
        })

    })

}

exports.addComment = (article_id, username, body) => {
    if (!body) {
        return Promise.reject({status: 400, msg: "body is missing from request"});
    } else if (typeof body !== "string") {
        return Promise.reject({status: 400, msg: "bad request"});
    }
    if (!username) {
        return Promise.reject({status: 400, msg: "username is missing from request"});
    }

    const queryString = `
        INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING comment_id, article_id, author, body, votes, created_at;`;
    
    return db.query(queryString, [article_id, username, body])
        .then(({rows}) => {
        return rows[0];
        })
}

exports.removeComment = (id) => {
    const queryString = `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;`;

    return db.query(queryString, [id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "comment not found"});
        }
    })
}