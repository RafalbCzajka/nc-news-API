const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createRef, formatData, replaceArticleTitleWithId } = require("../seeds/utils");

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
    .then(() => {
      return insertTopicsData(topicData);
    })
    .then(() => {
      return insertUsersData(userData);
    })
    .then(() => {
      return insertArticlesData(articleData);
    })
    .then((response) => {
      return insertCommentsData(response, commentData);
    })
};

const createTopicsTable = () => {
  return db.query(`CREATE TABLE topics(
    slug VARCHAR PRIMARY KEY,
    description VARCHAR NOT NULL,
    img_url VARCHAR(1000) NOT NULL
    )`);
};

const insertTopicsData = (topicsArray) => {
  const keys = ["slug", "description", "img_url"];
  const formattedTopics = formatData(topicsArray, keys);

  const sqlString = format(`INSERT INTO topics
    (slug, description, img_url)
    VALUES
    %L
    RETURNING *
    `, formattedTopics);

  return db.query(sqlString);
}

const createUsersTable = () => {
  return db.query(`CREATE TABLE users(
    username VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR(1000) NOT NULL
    )`);
};

const insertUsersData = (usersArray) => {
  const keys = ["username", "name", "avatar_url"];
  const formattedUsers = formatData(usersArray, keys);

  const sqlString = format(`INSERT INTO users
    (username, name, avatar_url)
    VALUES
    %L
    RETURNING *
    `, formattedUsers);

  return db.query(sqlString);
}

const createArticlesTable = () => {
  return db.query(`CREATE TABLE articles(
    article_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    topic VARCHAR REFERENCES topics(slug) ON DELETE CASCADE NOT NULL,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000) NOT NULL
    )`);
};

const insertArticlesData = (articlesArray) => {
  const convertedTimestampsArticlesArray = articlesArray.map(convertTimestampToDate);
  const keys = ["title", "topic", "author", "body", "created_at", "votes", "article_img_url"];
  const formattedArticles = formatData(convertedTimestampsArticlesArray, keys);

  const sqlString = format(`INSERT INTO articles
    (title, topic, author, body, created_at, votes, article_img_url)
    VALUES
    %L
    RETURNING *
    `, formattedArticles);

  return db.query(sqlString);
}

const createCommentsTable = () => {
  return db.query(`CREATE TABLE comments(
    comment_id SERIAL PRIMARY KEY,
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE NOT NULL,
    body TEXT NOT NULL,
    votes INT DEFAULT 0,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

const insertCommentsData = (response, commentsArray) => {
  const articleRef = createRef(response.rows, "title", "article_id");

  const convertedTimestampsCommentsArray = commentsArray.map(convertTimestampToDate);
  const commentsWithIdsArray = replaceArticleTitleWithId(convertedTimestampsCommentsArray, articleRef);
  const keys = ["article_id", "body", "votes", "author", "created_at"];
  const formattedComments = formatData(commentsWithIdsArray, keys);

  const sqlString = format(`INSERT INTO comments
  (article_id, body, votes, author, created_at)
  VALUES
  %L
  RETURNING *
  `, formattedComments);

  return db.query(sqlString);
}

module.exports = seed;
