const {fetchArticleById, fetchAllArticles, updateArticle, insertArticle, removeArticle} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params;
    
    fetchArticleById(article_id).then((article) => {
        res.status(200).send({article});
    }).catch(next);
}

exports.getAllArticles = (req, res, next) => {
    const query = {...req.query};

    const limit = query.limit !== undefined ? Number(query.limit) : 10;
    const page = query.p !== undefined ? Number(query.p) : 1;

    const isInvalidLimit = query.limit !== undefined && (!Number.isInteger(limit) || limit < 1);
    const isInvalidPage = query.p !== undefined && (!Number.isInteger(page) || page < 1);

    if (isInvalidLimit || isInvalidPage) {
    return res.status(400).send({ msg: "invalid limit or page query" });
  }

    query.limit = limit;
    query.page = page;

    fetchAllArticles(query).then(({articles, total_count}) => {
        res.status(200).send({articles, total_count});
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

exports.deleteArticleById = (req,res,next) => {
    const {article_id} = req.params;

    removeArticle(article_id).then(() => {
        res.status(204).send();
    }).catch(next);
}