const {fetchAllTopics} = require("../models/topics.model");

exports.getAllTopics = (req, res) => {
    fetchAllTopics().then((topics) => {
        res.status(200).send({topics});
    })
}