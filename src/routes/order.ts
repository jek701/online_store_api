import {Router} from "express"
import orderModel from "../models/order"

const order = Router()

// get all orders
order.get("/", async (req, res) => {
    const result = await orderModel.findAll()
    res.json(result)
})

// get order by id
order.get("/byorder/:id", async (req, res) => {
    const result = await orderModel.findByOrderId(req.params.id)
    res.json(result)
})

// get order by user id
order.get("/byuser/:id", async (req, res) => {
    const result = await orderModel.findAllOrdersByUserId(req.params.id)
    res.json(result)
})

// create order
order.post("/", async (req, res) => {
    const result = await orderModel.create(req.body)
    res.json(result)
})

// Change status
order.put("/status/:id", async (req, res) => {
    const result = await orderModel.changeStatus(req.params.id, req.body)
    res.json(result)
})

// Cancel order
order.put("/cancel/:id", async (req, res) => {
    const result = await orderModel.cancelOrder(req.params.id)
    res.json(result)
})

// Link order to user
order.post("/relation", async (req, res) => {
    const result = await orderModel.createRelation(req.body.product_id, req.body.category_id)
    res.json(result)
})


export default order