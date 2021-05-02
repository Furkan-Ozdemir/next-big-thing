const express = require("express")
const app = express()
const ejs = require("ejs")
const bodyParser = require("body-parser");
const User = require("./models/user");
const port = process.env.PORT | 3000
require("./db/mongoose")


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("welcome")
})
app.post("/", async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.redirect("/")
        }

        await user.generateAuthToken()
        res.redirect("/home")


    } catch (e) {
        console.log(e);
    }
})

app.get("/home", async (req, res) => { // buraya auth ekle üye olmayan göremesin
    const tweets = await User.getAllTweets()

    res.render("home", { allTweets: tweets })
})


app.get("/signup", (req, res) => {
    res.render("signup")
})
app.post("/signup", async (req, res) => {
    const user_email = req.body.email
    const user_password = req.body.password

    const user = new User({ email: user_email, password: user_password })

    try {
        await user.save()
        const token = await user.generateAuthToken()
        await user.sendMail(user.email)
        res.redirect("/home")
    } catch (e) {
        console.log(e)
        res.status(501).redirect("/signup")
    }


})

app.listen(port, () => {
    console.log("started on port", port);
})