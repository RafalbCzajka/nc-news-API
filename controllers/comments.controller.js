const {fetchCommentsByArticleId} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id;

    fetchCommentsByArticleId(article_id).then((comments) => {
        res.status(200).send({comments});
    }).catch((err) => {
        next(err);
    });
}