import express from 'express'
import product from "./src/routes/product";
require('dotenv').config()
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/product',product)

app.listen(process.env.PORT)