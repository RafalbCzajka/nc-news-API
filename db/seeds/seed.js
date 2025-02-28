const db = require("../connection");
//const {} = require("../seeds/utils");

const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query("DROP TABLE IF EXISTS comments;")
  .then(() => {
    return db.query("DROP TABLE IF EXISTS articles;")
  })
  .then(() => {
    return db.query("DROP TABLE IF EXISTS users;")
  })
  .then(() => {
    return db.query("DROP TABLE IF EXISTS topics;")
  })
  .then(() => {
    return createTopicsTable();
  })
  .then(() => {
    return createUsersTable();
  })
  .then(() => {
    return createArticlesTable();
  })
  .then(() => {
    return createCommentsTable();
  })
};

const createTopicsTable = () => {
  return db.query(`CREATE TABLE topics(
    slug VARCHAR PRIMARY KEY,
    description VARCHAR NOT NULL,
    img_url VARCHAR(1000) NOT NULL
    )`);
};

const createUsersTable = () => {
  return db.query(`CREATE TABLE users(
    username VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR(1000) NOT NULL
    )`);
};

const createArticlesTable = () => {
  return db.query(`CREATE TABLE articles(
    article_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    topic VARCHAR REFERENCES topics(slug) ON DELETE CASCADE,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000) NOT NULL
    )`);
};

const createCommentsTable = () => {
  return db.query(`CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    votes INT DEFAULT 0,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

module.exports = seed;
