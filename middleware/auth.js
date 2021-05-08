const User = require("../models/user")
const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization",)
        const decoded = jwt.verify(token, "harrypotterbetterthanlotr")
        const user = await User.findOne({ _id: decoded._id })
        console.log("token", token);
        console.log("decoded", decoded);
        console.log("user", user);
        console.log("req.token=", req.token);
        console.log("req.user=", req.user);
        if (!user)
            throw new Error()

        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send(e)
    }
}

module.exports = auth