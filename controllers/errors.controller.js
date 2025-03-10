exports.invalidPathHandler = (req, res) => {
    res.status(404).send({msg: "path not found"});
}

exports.serverErrorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg: "server error"});
}