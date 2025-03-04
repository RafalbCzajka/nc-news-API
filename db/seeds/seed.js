const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, createRef } = require("../seeds/utils");

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
    .then((response) => {
      console.log(response);
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
  const formattedTopics = topicsArray.map((topic) => {
    return [topic.slug, topic.description, topic.img_url]
  });

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
  const formattedUsers = usersArray.map((user) => {
    return [user.username, user.name, user.avatar_url]
  });

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
    topic VARCHAR REFERENCES topics(slug) ON DELETE CASCADE,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    votes INT DEFAULT 0,
    article_img_url VARCHAR(1000) NOT NULL
    )`);
};

const insertArticlesData = (articlesArray) => {
  const formattedArticles = articlesArray.map((article) => {
    const formattedArticle = convertTimestampToDate(article);
    return [
      formattedArticle.title,
      formattedArticle.topic,
      formattedArticle.author,
      formattedArticle.body,
      formattedArticle.created_at,
      formattedArticle.votes,
      formattedArticle.article_img_url
    ];
  });

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
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    votes INT DEFAULT 0,
    author VARCHAR REFERENCES users(username) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}

const insertCommentsData = (response, commentsArray) => {
  const articleRef = createRef(response.rows, "title", "article_id");

  const formattedComments = commentsArray.map((comment) => {
    const formattedComment = convertTimestampToDate(comment);
    return [
      articleRef[formattedComment.article_title], 
      formattedComment.body, 
      formattedComment.votes, 
      formattedComment.author,
      formattedComment.created_at
    ]
  });

  const sqlString = format(`INSERT INTO comments
  (article_id, body, votes, author, created_at)
  VALUES
  %L
  RETURNING *
  `, formattedComments);

  return db.query(sqlString);
}

module.exports = seed;
