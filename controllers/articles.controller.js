const {fetchArticleById, fetchAllArticles, updateArticle, insertArticle} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    
    fetchArticleById(article_id).then((article) => {
        res.status(200).send({article});
    }).catch(next);
}

exports.getAllArticles = (req, res, next) => {
    const query = req.query;

    fetchAllArticles(query).then((articles) => {
        res.status(200).send({articles});
    }).catch(next);
    }

exports.patchArticle = (req, res, next) => {
    const {article_id} = req.params;
    const {inc_votes} = req.body;

    updateArticle(article_id, inc_votes).then((article) => {
        res.status(200).send({article});
    }).catch(next);
}

exports.postArticle = (req, res, next) => {
    const {author, title, body, topic, article_img_url} = req.body;

    insertArticle({author, title, body, topic, article_img_url}).then((article) => {
        res.status(201).send({article});
    }).catch(next);
}