const db = require("./db/connection");

const getAllUsers = () => {
    return db.query("SELECT username FROM users;")
    .then((response) => response.rows);
}

const getAllCodingArticles = () => {
    return db.query("SELECT title, topic, author FROM articles WHERE topic = 'coding';")
    .then((response) => response.rows);
}

const getAllCommentsWithZeroVotes = () => {
    return db.query("SELECT comment_id, author, votes FROM comments WHERE votes = 0;")
    .then((response) => response.rows);
}

const getAllTopics = () => {
    return db.query("SELECT slug FROM topics;")
    .then((response) => response.rows);
}

const getAllArticlesByGrumpy19 = () => {
    return db.query("SELECT title, author FROM articles WHERE author = 'grumpy19'")
    .then((response) => response.rows);
}

const getAllCommentsWithOver10Votes = () => {
    return db.query("SELECT comment_id, author, votes FROM comments WHERE votes > 10;")
    .then((response) => response.rows);
}

const queries = [
    {name: "Get all of the users", func: getAllUsers},
    {name: "Get all of the articles where the topic is coding", func: getAllCodingArticles},
    {name: "Get all of the comments where the votes are less than zero", func: getAllCommentsWithZeroVotes},
    {name: "Get all of the topics", func: getAllTopics},
    {name: "Get all of the articles by user grumpy19", func: getAllArticlesByGrumpy19},
    {name: "Get all of the comments that have more than 10 votes", func: getAllCommentsWithOver10Votes}
];

Promise.all(queries.map(({func}) => func()))
    .then((response) => {
        response.forEach((result, index) => {
            console.log(`${queries[index].name}:`, result);
        });
    })
    .finally(() => db.end());