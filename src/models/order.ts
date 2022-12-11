import {nanoid} from "nanoid"
import {Order} from "types/order"
import moment from "moment"

const neo4j = require("neo4j-driver")
require("dotenv").config()
const {
    url,
    db_username,
    db_password,
    database
} = process.env
const driver = neo4j.driver(url, neo4j.auth.basic(db_username, db_password))
const session = driver.session({database})

const findAll = async () => {
    // Return all orders with all relations
    const result = await session.run(`MATCH p = (u:Order)-[b]->(a) return p`)
    return result.records.map(i => i.get("p").segments[0].relationship.properties)
}

const findAllOrdersByUserId = async (user_id: string) => {
    const result = await session.run(`MATCH (u:Order {user_id : '${user_id}'} ) return u limit 1`)
    return result.records.map(i => i.get("u").properties)
}

const findByOrderId = async (order_id: string) => {
    const result = await session.run(`MATCH (u:Order {_id : '${order_id}'} ) return u limit 1`)
    return result.records[0].get("u").properties
}

// Change
const create = async (category: Order) => {
    const unique_id = nanoid(8)
    // Creat relation between order and order items
    await session.run(`CREATE (u:Order {_id : "${unique_id}", user_id: "${category.user_id}", status: "waiting", order_date: "${moment()}", total_price: "${category.order_items.reduce((a, b) => a + b.price * b.quantity, 0)}", delivery_type: "${category.delivery_type}", delivery_address: "${category.delivery_address}", delivery_date: "not_delivered", payment_type: "${category.payment_type}", created_at: "${moment()}", updated_at: "${moment()}"}) return u`)
    // Link order to user
    await session.run(`MATCH (o: Order {_id : '${unique_id}'}), (u: User {_id : '${category.user_id}'}) CREATE (u)-[r:ORDER {when: "${moment()}", quantity: "${category.order_items.length}", product_ids: "${category.order_items.map(i => i.product_id)}"}]->(o) return r`)
    for (let i = 0; i < category.order_items.length; i++) {
        await session.run(`MATCH (u:Order {_id: "${unique_id}"}) CREATE (i:OrderedProduct {product_id: "${category.order_items[i].product_id}", name: "${category.order_items[i].name}", quantity: ${category.order_items[i].quantity}, price: ${category.order_items[i].price}, created_at: "${moment()}"})<-[:ORDER_ITEM {product_id: "${category.order_items[i].product_id}"}]-(u) return i`)
    }
    return await findByOrderId(unique_id)
}

const changeStatus = async (id: string, order: Order) => {
    await session.run(`MATCH (u:Order {_id : '${id}'}) SET u.status = "${order.status}" return u`)
    return await findByOrderId(id)
}

const cancelOrder = async (id: string) => {
    await session.run(`MATCH (u:Order {_id : '${id}'}) SET u.status = "cancelled" return u`)
    return await findByOrderId(id)
}

// Change
const createRelation = async (order_id: string, user_id: string) => {
    await session.run(`MATCH (o: Order {_id : '${order_id}'}), (u: User {_id : '${user_id}'}) CREATE (u)-[r:ORDER]->(o) return r`)
    return await findAll()
}

export default {
    findAll,
    findAllOrdersByUserId,
    findByOrderId,
    create,
    createRelation,
    changeStatus,
    cancelOrder
}