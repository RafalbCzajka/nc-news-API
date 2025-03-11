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
    }
    if (!username) {
        return Promise.reject({status: 400, msg: "username is missing from request"});
    }

    return checkExists("articles", "article_id", article_id).then((articleExists) => {
        if (!articleExists) {
            return Promise.reject({status: 404, msg: "article not found"});
        }

        return checkExists("users", "username", username);
    })
    .then((userExists) => {
        if (!userExists) {
            return Promise.reject({status: 404, msg: "user not found"});
        }


        const queryString = `
        INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING comment_id, article_id, author, body, created_at;`;
    
        return db.query(queryString, [article_id, username, body]);
    })
    .then(({rows}) => {
        return rows[0];
    })
}