const User = require("../models/user");
const jwt = require("jsonwebtoken")

const verifyToken = async (req, res, next) => {
    try {

        const token = req.headers['authorization'];
        console.log("token", token);
        const decoded = jwt.verify(token, "harrypotterbetterthanlotr")
        const user = await User.findOne({ _id: decoded._id })

        if (!user) {
            throw new Error("User not found")
        }
        // Set the token
        req.token = token;
        req.user = user
        // Next middleware
        next();

    } catch (e) {
        // Forbid the route
        console.log("Authorization", req.header("authorization"));
        console.log("req token", req.token);
        // console.log("req header", header);
        res.status(401).send(e)

    }

}

module.exports = verifyToken