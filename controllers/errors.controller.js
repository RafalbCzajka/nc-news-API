exports.invalidPathHandler = (req, res) => {
    res.status(404).send({msg: "path not found"});
}

exports.psqlErrorHandler = (err, req, res, next) => {
    if (err.code === "22P02") {
        return res.status(400).send({msg: "bad request"})
    }
    next(err);
}

exports.customErrorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        return res.status(err.status).send({msg: err.msg})
    }
    next(err);
}

exports.serverErrorHandler = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({msg: "server error"});
}