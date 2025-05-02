const {fetchAllUsers, fetchUserByUsername} = require("../models/users.model");

exports.getAllUsers = (req, res, next) => {
    fetchAllUsers().then((users) => {
        res.status(200).send({users});
    }).catch(next);
}

exports.getUserByUsername = (req, res, next) => {
    const {username} = req.params;

    fetchUserByUsername(username).then((user) => {
        if (!user) {
            res.status(404).send({msg: "User not found"});
        }
        res.status(200).send({user});
    }).catch(next);
}