import { Router } from "express";
import productModel from '../models/product'
const user = Router()


user.get('/', async (req,res)=>{
    const result = await productModel.findAll()
    res.json(result)
})
user.get('/:id', async (req,res)=>{
    const result = await productModel.findById(req.params.id)
    res.json(result)
})
user.post('/', async (req,res)=>{
    const result = await productModel.create(req.body)
    res.json(result)
})
user.put('/:id', async (req,res)=>{
    const result = await productModel.findByIdAndUpdate(req.params.id, req.body)
    res.json(result)
})

user.delete('/:id', async (req,res)=>{
    const result = await productModel.findByIdAndDelete(req.params.id)
    res.json(result)
})

export default user