const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')

const bcrypt = require('bcrypt')
const userModel = require("./models/User")
const postModel = require("./models/post")

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

app.set("view engine", "ejs")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.get('/', (req, res) => {
    res.render("index")

})
app.get('/login', (req, res) => {
    res.render("login")

})

app.post('/register', async (req, res) => {
    let { email, password, username, name, age } = req.body

    let user = await userModel.findOne({ email })
    if (user) {
        return res.status(500).send("User already registered")
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            console.log(salt)
            bcrypt.hash(password, salt, async (err, hash) => {
                console.log(hash);
                let user = await userModel.create({
                    username,
                    email,
                    age,
                    name,
                    password: hash

                })
                let token = jwt.sign({ email: email, userid: user._id }, "shweta")
                console.log(token, "token");
                res.cookie("token", token)
                res.send("REGISTERED")
            })
        })

    }

})


app.post('/login', async (req, res) => {
    let { email, password } = req.body

    let user = await userModel.findOne({ email })
    if (!user) return res.status(500).send("Something Went Wrong")


    bcrypt.compare(password, user.password, (err, result) => {
        if (result) res.status(200).send("You Can Login")
            let token = jwt.sign({ email: email, userid: user._id }, "shweta")
        console.log(token, "token");
        res.cookie("token", token)
        else res.redirect("/login")
    })



})

app.get('/logout', (req, res) => {
    res.cookie("token")
    res.redirect("/login")

})
app.get('/profile', isLogggedIn, (req, res) => {
    res.render("login")

})


function isLogggedIn(req, res, next) {
    console.log(req.cookies)
    if (req.coookies.token === "") res.send("You must be logged in")
    else {
        let data = jwt.verify(req.cookies.token, "shweta")
        req.user = data
    }
    next()
}

app.listen(port, () => {
    console.log(`server is running on this port ${port}`)
})

