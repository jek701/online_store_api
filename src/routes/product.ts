import {Router} from "express"
import productModel from "../models/product"

const product = Router()

product.get("/", async (req, res) => {
    const result = await productModel.findAll()
    res.json(result)
})
product.get("/:id", async (req, res) => {
    const result = await productModel.findById(req.params.id)
    res.json(result)
})
product.post("/", async (req, res) => {
    const result = await productModel.create(req.body)
    res.json(result)
})
product.put("/:id", async (req, res) => {
    const result = await productModel.findByIdAndUpdate(req.params.id, req.body)
    res.json(result)
})

product.delete("/:id", async (req, res) => {
    const result = await productModel.findByIdAndDelete(req.params.id)
    res.json(result)
})

product.get("/category/:id", async (req, res) => {
    const result = await productModel.getProductsByCategory(req.params.id)
    res.json(result)
})

product.post("/category", async (req, res) => {
    const result = await productModel.addProductToCategory(req.body.product_id, req.body.category_id)
    res.json(result)
})

product.delete("/category", async (req, res) => {
    const result = await productModel.removeProductFromCategory(req.body.product_id, req.body.category_id)
    res.json(result)
})

export default product