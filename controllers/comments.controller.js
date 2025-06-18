const {fetchCommentsByArticleId, addComment, removeComment, updateCommentVotesById} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
    const {article_id} = req.params;
    const query = {...req.query};

    const limit = query.limit !== undefined ? Number(query.limit) : 10;
    const page = query.p !== undefined ? Number(query.p) : 1;

    const isInvalidLimit = query.limit !== undefined && (!Number.isInteger(limit) || limit < 1);
    const isInvalidPage = query.p !== undefined && (!Number.isInteger(page) || page < 1);

    if (isInvalidLimit || isInvalidPage) {
        return res.status(400).send({msg: "Invalid limit or page query"});
    }

    const offset = (page - 1) * limit;

    fetchCommentsByArticleId(article_id, limit, offset).then((comments) => {
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