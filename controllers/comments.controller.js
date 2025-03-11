const {fetchCommentsByArticleId, addComment} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id;

    fetchCommentsByArticleId(article_id).then((comments) => {
        res.status(200).send({comments});
    }).catch((err) => {
        next(err);
    });
}

exports.postComment = (req, res, next) => {
    const {article_id} = req.params;
    const {username, body} = req.body;

    addComment(article_id, username, body).then((comment) => {
        res.status(201).send({comment});
    }).catch((err) => {
        next(err);
    });

}