import express from "express"
import product from "./src/routes/product"

require("dotenv").config()
const app = express(), jwt = require("jsonwebtoken"),
    users = require("./src/users.json")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/product", product)
const tokenKey = "1a2b-3c4d-5e6f-7g8h"

app.use((req, res, next) => {
    if (req.headers.authorization) {
        jwt.verify(
            req.headers.authorization.split(" ")[1],
            tokenKey,
            (err, payload) => {
                if (err) next()
                else if (payload) {
                    for (let user of users) {
                        if (user.id === payload.id) {
                            req.user = user
                            next()
                        }
                    }

                    if (!req.user) next()
                }
            }
        )
    }
    next()
})

app.post("/api/auth", (req, res) => {
    for (let user of users) {
        if (
            req.body.login === user.login &&
            req.body.password === user.password
        ) {
            return res.status(200).json({
                id: user.id,
                login: user.login,
                token: jwt.sign({id: user.id}, tokenKey)
            })
        }
    }

    return res.status(404).json({message: "User not found"})
})

app.get("/user", (req, res) => {
    if (req.user) return res.status(200).json(req.user)
    else
        return res
            .status(401)
            .json({message: "Not authorized"})
})

app.listen(process.env.PORT)