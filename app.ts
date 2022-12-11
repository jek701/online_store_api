import express from "express"
import product from "./src/routes/product"
import category from "./src/routes/category"
import order from "./src/routes/order"

require("dotenv").config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/product", product)
app.use("/category", category)
app.use("/order", order)
app.listen(process.env.PORT)