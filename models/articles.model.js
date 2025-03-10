const db = require("../db/connection");

exports.fetchArticleById = (id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [id])
        .then(({rows}) => {
            if (rows.length === 0) {
                return Promise.reject({status: 404, msg: "article not found"});
            }
            return rows[0];
        });
};

exports.fetchAllArticles = (queries) => {
    let {author, topic, sort_by = "created_at", order = sort_by === "created_at" ? "desc" : "asc"} = queries;

    const validSortBy = ["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count"];
    const validOrder = ["asc", "desc"];

    if (!validSortBy.includes(sort_by)) {
        sort_by = "created_at";
    }
    if (!validOrder.includes(order)) {
        order = "desc";
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
                            COUNT(comments.article_id) AS comment_count 
    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;

    if (author) {
        queryParams.push(author);
        queryString += ` WHERE articles.author = $${queryParams.length}`;
    }

    if (topic) {
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

    return db.query(queryString, queryParams).then(({rows}) => {
        return rows;
    })
}
