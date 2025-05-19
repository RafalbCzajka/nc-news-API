const {fetchCommentsByArticleId, addComment, removeComment, updateCommentVotesById} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;

    fetchCommentsByArticleId(article_id).then((comments) => {
        res.status(200).send({comments});
    }).catch(next);
}

exports.postComment = (req, res, next) => {
    const {article_id} = req.params;
    const {username, body} = req.body;

    addComment(article_id, username, body).then((comment) => {
        res.status(201).send({comment});
    }).catch(next);
}

exports.deleteComment = (req, res, next) => {
    const {comment_id} = req.params;

    removeComment(comment_id).then(() => {
        res.status(204).send();
    }).catch(next);
}

exports.patchCommentById = (req, res, next) => {
    const {comment_id} = req.params;
    const {inc_votes} = req.body;

    if (typeof inc_votes !== "number") {
        return res.status(400).send({msg: "Invalid inc_votes value"});
    }

    updateCommentVotesById(comment_id, inc_votes).then((updatedComment) => {
        res.status(200).send({comment: updatedComment});
    }).catch(next);
}