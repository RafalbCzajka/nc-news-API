const db = require("../db/connection");
const {checkExists} = require("../db/seeds/utils");

exports.fetchArticleById = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [id])
        .then(({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({status: 404, msg: "article not found"});
            }
            return rows[0];
        });
};

exports.fetchAllArticles = async (queries) => {
    let {author, topic, sort_by = "created_at", order = sort_by === "created_at" ? "desc" : "asc"} = queries;

    const validSortBy = ["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count"];
    const validOrder = ["asc", "desc"];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({status: 400, msg: "invalid query parameter: sort_by"});
    }
    if (!validOrder.includes(order)) {
        return Promise.reject({status: 400, msg: "invalid query parameter: order"});
    }
    if (sort_by !== "comment_count") {
        sort_by = `articles.${sort_by}`;
    }

    const queryParams = [];
    let queryString = `SELECT articles.author, 
                            articles.title, 
                            articles.article_id, 
                            articles.topic, 
                            articles.created_at, 
                            articles.votes, 
                            articles.article_img_url, 
                            CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count 
    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;

    const checkPromises = [];

    if (author) {
        checkPromises.push(checkExists("users", "username", author));
        queryParams.push(author);
        queryString += ` WHERE articles.author = $${queryParams.length}`;
    }

    if (topic) {
        checkPromises.push(checkExists("topics", "slug", topic));
        if (queryParams.length > 0) {
            queryString += ` AND`;
        } else {
            queryString += ` WHERE`;
        }
        queryParams.push(topic);
        queryString += ` articles.topic = $${queryParams.length}`;
    }

    queryString += ` GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

    const checkResults = await Promise.all(checkPromises);

    if (author && !checkResults[0]) {
        return Promise.reject({status: 404, msg: "username not found"});
    }
    if (topic && checkResults.length > 1 && !checkResults[1]) {
        return Promise.reject({status: 404, msg: "slug not found"});
    } else if (topic && !checkResults[0]) {
        return Promise.reject({status: 404, msg: "slug not found"});
    }

    return db.query(queryString, queryParams).then(({rows}) => {
        return rows;
    })
}

exports.updateArticle = (id, votes) => {
    if (votes === undefined || typeof votes !== "number") {
        return Promise.reject({status: 400, msg: "bad request"});
    }

    const sqlString = `UPDATE articles SET votes = votes + $1 
    WHERE article_id = $2
    RETURNING *;`;

    return db.query(sqlString, [votes, id])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "article not found"});
        }
        return rows[0];
    })
}