const express = require("express")
const app = express()
const ejs = require("ejs")
const bodyParser = require("body-parser");
const User = require("./models/user");
const port = process.env.PORT | 3000
require("./db/mongoose")
const auth = require("./middleware/auth")
const verifyToken = require("./middleware/verifyToken")
const jwt = require("jsonwebtoken")
const url = require("url")
//log out route u yapılcak

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("welcome")
})
app.post("/", async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password })

        if (!user) {
            return res.status(401).send("no user found")
        }

        const token = await user.generateAuthToken()
        const decoded = jwt.verify(token, "harrypotterbetterthanlotr")

        res.redirect("/home?token=" + token + "&_id=" + user._id.toString())

    } catch (e) {
        res.status(400).send("verification error")
    }
})

app.get("/home", async (req, res) => { // buraya auth ekle üye olmayan göremesin
    if (!req.query.token || !req.query._id)
        return res.status(404).send("no token provided")

    try {
        const token = req.query.token
        const _id = req.query._id
        const decoded = jwt.verify(token, "harrypotterbetterthanlotr")
        const tweets = await User.getAllTweets()
        res.render("home", { allTweets: tweets })
    }
    catch (e) {
        res.status(400).send("verification error")

    }
})

app.post("/home", async (req, res) => { // logged in user ın tweets arrayine pushla bu kdr.
    // sonrada auth eklemeyi unutma
    const tweet = req.body.tweet
    // const user = await User.findOne({})
    // req.user.tweets.push(tweet)
    const queryObject = url.parse(req.url, true).query
    console.log(queryObject.token)
    // res.redirect("/home")
})
app.get("/signup", (req, res) => {
    res.render("signup")
})
app.post("/signup", async (req, res) => {
    const user_email = req.body.email
    const user_password = req.body.password
    const user = new User({ email: user_email, password: user_password })

    try {
        // const token = await user.generateAuthToken()
        const token = jwt.sign({ _id: user._id.toString() }, "harrypotterbetterthanlotr")
        // res.header('Authorization', token);
        // console.log(token === res.getHeader("Authorization"));
        user.tokens.push(token)
        await user.save()
        await user.sendMail(user.email)
        res.redirect("/home?token=" + token + "&_id=" + user._id.toString())

    } catch (e) {
        console.log(e)
        res.status(501).redirect("/signup")
    }


})


app.listen(port, () => {
    console.log("started on port", port);
})