const jwt = require('jsonwebtoken')
const mongoose = require("mongoose")
const validator = require("validator")
const nodemailer = require("nodemailer");


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid")
            }
        }
    },
    password: [{
        type: String,
        reqired: true,
        trim: true
    }],
    tweets: [{
        type: String,
        trim: true
    }],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }]
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, "harrypotterbetterthanlotr")
    user.tokens.push({ token })
    await user.save()

}

userSchema.methods.sendMail = async (email) => {
    const user = await User.findOne({ email })

    if (!user)
        throw new Error("no user with email", email)

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        auth: {
            user: "assign.it@yahoo.com", // generated ethereal user
            pass: "rfcnzfacbrefvnex", // generated ethereal password
        },
    });

    try {
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: 'assign.it@yahoo.com', // sender address
            to: email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: `Hello \n your email address: ${email} \n password: ${user.password}`, // plain text body
            // html: "<b>Hello world?</b>", // html body
        });
        console.log("Message sent: %s", info.messageId);
    } catch (e) {
        console.log(e)

    }

}

userSchema.statics.getAllTweets = async () => {
    const users = await User.find({})
    const allTweets = []

    users.forEach((user) => {
        user.tweets.forEach((tweet) => {
            allTweets.push(tweet)
        })
    })
    return allTweets
}

const User = mongoose.model("User", userSchema)

module.exports = User