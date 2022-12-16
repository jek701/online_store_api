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

const findAll = async () => {
    // Create a session to communicate with the database and close it after use
    const session = driver.session({database})
    try {
        const result = await session.run("MATCH (u:Order) return u")
        return result.records.map(i => i.get("u").properties)
    } finally {
        await session.close()
    }
}

const findOrderItemsByOrderId = async (order_id: string) => {
    const session = driver.session({database})
    try {
        const result = await session.run(`MATCH (u:Order {_id : '${order_id}'})-[r:ORDER_ITEM]->(i:OrderedProduct) return i`)
        return result.records.map(i => i.get("i").properties)
    } finally {
        await session.close()
    }
}

const findAllOrdersByUserId = async (user_id: string) => {
    const session = driver.session({database})
    try {
        const result = await session.run(`MATCH (u:Order {user_id : '${user_id}'} ) return u limit 1`)
        return result.records.map(i => i.get("u").properties)
    } finally {
        await session.close()
    }
}

const findByOrderId = async (order_id: string) => {
    const session = driver.session({database})
    try {
        const result = await session.run(`MATCH (u:Order {_id : '${order_id}'} ) return u limit 1`)
        return result.records[0].get("u").properties
    } finally {
        await session.close()
    }
}

// Change
const create = async (category: Order) => {
    const unique_id = nanoid(8)
    const user_id = nanoid(12)
    // Creat relation between order and order items
    const session = driver.session({database})
    try {
        await session.run(`CREATE (u:Order {_id : "${unique_id}", user_name: "${category.user.name}", user_number: "${category.user.number}", status: "waiting", order_date: "${moment()}", total_price: "${category.order_items.reduce((a, b) => a + b.price * b.quantity, 0)}", delivery_type: "${category.delivery_type}", delivery_address: "${category.delivery_address}", delivery_date: "not_delivered", payment_type: "${category.payment_type}", created_at: "${moment()}", updated_at: "${moment()}"}) return u`)
        // If no user found, create a new user and create relation between order and user
        await session.run(`MATCH (u:User {number : '${category.user.number}'}) return u limit 1`).then(async (result: any) => {
            if (result.records.length === 0) {
                await session.run(`CREATE (u:User {_id: "${user_id}", number : "${category.user.number}", name: "${category.user.name}", created_at: "${moment()}", updated_at: "${moment()}"}) return u`)
                await session.run(`MATCH (u:User {_id : '${user_id}'}), (o:Order {_id : '${unique_id}'}) CREATE (u)-[r:ORDERED]->(o) return r`)
            } else {
                await session.run(`MATCH (u:User {number : '${category.user.number}'}), (o:Order {_id : '${unique_id}'}) CREATE (u)-[r:ORDERED]->(o) return r`)
            }
        })
        for (let i = 0; i < category.order_items.length; i++) {
            await session.run(`MATCH (u:Order {_id: "${unique_id}"}) CREATE (i:OrderedProduct {product_id: "${category.order_items[i].product_id}", name: "${category.order_items[i].name}", quantity: ${category.order_items[i].quantity}, price: ${category.order_items[i].price}, created_at: "${moment()}"})<-[:ORDER_ITEM {product_id: "${category.order_items[i].product_id}"}]-(u) return i`)
        }
        return await findByOrderId(unique_id)
    } finally {
        await session.close()
    }
}

const changeStatus = async (status: string, order_id: string) => {
    const session = driver.session({database})
    try {
        if (status === "waiting" || "cancelled" || "delivered" || "readyForDelivery" || "readyForPickup" || "closed") {
            await session.run(`MATCH (u:Order {_id : '${order_id}'}) SET u.status = "${status}" return u`)
        } else {
            return "Invalid status"
        }
        return await findByOrderId(order_id)
    } finally {
        await session.close()
    }
}

const cancelOrder = async (id: string) => {
    const session = driver.session({database})
    try {
        await session.run(`MATCH (u:Order {_id : '${id}'}) SET u.status = "cancelled" return u`)
        return await findByOrderId(id)
    } finally {
        await session.close()
    }
}

// Change
const createRelation = async (order_id: string, user_id: string) => {
    const session = driver.session({database})
    try {
        await session.run(`MATCH (o: Order {_id : '${order_id}'}), (u: User {_id : '${user_id}'}) CREATE (u)-[r:ORDER]->(o) return r`)
        return await findAll()
    } finally {
        await session.close()
    }
}

export default {
    findAll,
    findAllOrdersByUserId,
    findOrderItemsByOrderId,
    findByOrderId,
    create,
    createRelation,
    changeStatus,
    cancelOrder
}
