import {Router} from "express"
import categoryModel from "../models/category"

const category = Router()

category.get("/", async (req, res) => {
    const result = await categoryModel.findAll()
    res.json(result)
})
category.get("/:id", async (req, res) => {
    const result = await categoryModel.findById(req.params.id)
    res.json(result)
})
category.post("/", async (req, res) => {
    const result = await categoryModel.create(req.body)
    res.json(result)
})
category.put("/:id", async (req, res) => {
    const result = await categoryModel.findByIdAndUpdate(req.params.id, req.body)
    res.json(result)
})

category.delete("/:id", async (req, res) => {
    const result = await categoryModel.findByIdAndDelete(req.params.id)
    res.json(result)
})

category.post("/relation", async (req, res) => {
    const result = await categoryModel.createRelation(req.body.product_id, req.body.category_id)
    res.json(result)
})

category.delete("/relation", async (req, res) => {
    const result = await categoryModel.deleteRelation(req.body.product_id, req.body.category_id)
    res.json(result)
})

category.get("/relation/:id", async (req, res) => {
    const result = await categoryModel.getAllProductsOfCategory(req.params.id)
    res.json(result)
})

export default category