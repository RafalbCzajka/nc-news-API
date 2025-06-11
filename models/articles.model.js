const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.fetchArticleById = (id) => {
    const sqlString = `
    SELECT articles.*, 
    CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count  
    FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`;

    return db.query(sqlString, [id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "article not found" });
            }
            return rows[0];
        });
};

exports.fetchAllArticles = async (queries) => {
    let { author, topic, sort_by = "created_at", order = sort_by === "created_at" ? "desc" : "asc", limit = 10, p = 1 } = queries;

    const validSortBy = ["author", "title", "article_id", "topic", "created_at", "votes", "article_img_url", "comment_count"];
    const validOrder = ["asc", "desc"];

    if (!validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "invalid query parameter: sort_by" });
    }
    if (!validOrder.includes(order)) {
        return Promise.reject({ status: 400, msg: "invalid query parameter: order" });
    }

    // limit = parseInt(limit);
    // p = parseInt(p);

    // if (isNaN(limit) || limit < 1 || isNaN(p) || p < 1) {
    //     return Promise.reject({ status: 400, msg: "invalid query parameter: limit or p" });
    // }

    const offset = (p - 1) * limit;

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
    let whereConditions = [];

    if (author) {
        checkPromises.push(checkExists("users", "username", author));
        queryParams.push(author);
        // queryString += ` WHERE articles.author = $${queryParams.length}`;
        whereConditions.push(`articles.author = $${queryParams.length}`);
    }

    // if (topic) {
    //     checkPromises.push(checkExists("topics", "slug", topic));
    //     if (queryParams.length > 0) {
    //         queryString += ` AND`;
    //     } else {
    //         queryString += ` WHERE`;
    //     }
    //     queryParams.push(topic);
    //     queryString += ` articles.topic = $${queryParams.length}`;
    // }

    if (topic) {
        checkPromises.push(checkExists("topics", "slug", topic));
        queryParams.push(topic);
        whereConditions.push(`articles.topic = $${queryParams.length}`);
    }

    if (whereConditions.length > 0) {
        queryString += " WHERE " + whereConditions.join(" AND ");
    }

    queryString += ` GROUP BY articles.article_id 
    ORDER BY ${sort_by} ${order} 
    LIMIT $${queryParams.length + 1} 
    OFFSET $${queryParams.length + 2};`;

    let countQuery = `SELECT COUNT(*)::INT AS total_count FROM articles`;
    if (whereConditions.length > 0) {
        countQuery += " WHERE " + whereConditions.join(" AND ");
    }

    const checkResults = await Promise.all(checkPromises);

    // if (author && !checkResults[0]) {
    //     return Promise.reject({status: 404, msg: "username not found"});
    // }
    // if (topic && checkResults.length > 1 && !checkResults[1]) {
    //     return Promise.reject({status: 404, msg: "slug not found"});
    // } else if (topic && !checkResults[0]) {
    //     return Promise.reject({status: 404, msg: "slug not found"});
    // }

    let checkIndex = 0;

    if (author) {
        if (!checkResults[checkIndex]) {
            return Promise.reject({ status: 404, msg: "username not found" });
        }
        checkIndex++;
    }

    if (topic) {
        if (!checkResults[checkIndex]) {
            return Promise.reject({ status: 404, msg: "slug not found" });
        }
    }

    // return db.query(queryString, queryParams).then(({rows}) => {
    //     return rows;
    // })

    const articlesPromise = db.query(queryString, [...queryParams, limit, offset]);
    const countPromise = db.query(countQuery, queryParams);

    const [articlesResult, countResult] = await Promise.all([articlesPromise, countPromise]);

    return {
        articles: articlesResult.rows,
        total_count: countResult.rows[0].total_count
    };
}

exports.updateArticle = (id, votes) => {
    if (votes === undefined) {
        return this.fetchArticleById(id);
    }

    const sqlString = `UPDATE articles SET votes = votes + $1 
    WHERE article_id = $2
    RETURNING *;`;

    return db.query(sqlString, [votes, id])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "article not found" });
            }
            return rows[0];
        })
}

exports.insertArticle = async ({ author, title, body, topic, article_img_url }) => {
    if (!author || !title || !body || !topic) {
        return Promise.reject({ status: 400, msg: "Missing required fields" });
    }

    if (typeof author !== "string" || typeof title !== "string" || typeof body !== "string" || typeof topic !== "string") {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }

    const defaultImgUrl = "https://wallpapers.com/images/hd/windows-default-background-ihuecjk2mhalw3nq.jpg";

    const sqlString = `
    INSERT INTO articles (author, title, body, topic, article_img_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;`

    const result = await db.query(sqlString, [author, title, body, topic, article_img_url || defaultImgUrl]);

    const article = result.rows[0];

    const commentCountResult = await db.query(`SELECT COUNT(*)::int AS comment_count FROM comments WHERE article_id = $1;`, [article.article_id]);

    return { ...article, comment_count: commentCountResult.rows[0].comment_count };
}

exports.removeArticle = async (article_id) => {
    if (isNaN(article_id)) {
        return Promise.reject({ status: 400, msg: "Invalid article_id" });
    }

    const sqlString = `DELETE FROM articles WHERE article_id = $1 RETURNING *;`

    const result = await db.query(sqlString, [article_id]);

    if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
    }

    return result.rows[0];
}