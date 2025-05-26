const {getArticleById, getAllArticles, patchArticle, postArticle} = require("../controllers/articles.controller");
const {getCommentsByArticleId, postComment} = require("../controllers/comments.controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getAllArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.post("/", postArticle);

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postComment);

module.exports = articlesRouter;