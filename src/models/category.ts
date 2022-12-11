import {nanoid} from "nanoid"
import {Category} from "types/category"
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
    const result = await session.run(`Match (u:Category) return u`)
    return result.records.map(i => i.get("u").properties)
}

const findById = async (id: string) => {
    const result = await session.run(`MATCH (u:Category {_id : '${id}'} ) return u limit 1`)
    return result.records[0].get("u").properties
}
const create = async (category: Category) => {
    const unique_id = nanoid(8)
    await session.run(`CREATE (u:Category {_id : '${unique_id}', name: '${category.name}', created_at: "${category.created_at}", updated_at: "${moment()}"}) return u`)
    return await findById(unique_id)
}
const findByIdAndUpdate = async (id: string, category: Category) => {
    const result = await session.run(`MATCH (u:Category {_id : '${id}'}) SET u = {_id: '${category._id}', name: '${category.name}', created_at: "${category.created_at}", updated_at: "${moment()}"} return u`)
    return result.records[0].get("u").properties
}
const findByIdAndDelete = async (id: string) => {
    await session.run(`MATCH (u:Category {_id : '${id}'}) DETACH DELETE u`)
    return await findAll()
}

const createRelation = async (product_id: string, category_id: string) => {
    await session.run(`MATCH (c: Category {_id : '${category_id}'}), (p: Product {_id : '${product_id}'}) CREATE (c)-[r:HAS_PRODUCT]->(p) return r`)
    return await findAll()
}

const deleteRelation = async (product_id: string, category_id: string) => {
    await session.run(`MATCH (c: Category {_id : '${category_id}'})-[r:HAS_PRODUCT]->(p: Product {_id : '${product_id}'}) DELETE r`)
    return await findAll()
}

const getAllProductsOfCategory = async (id: string) => {
    const result = await session.run(`MATCH (a:Category{_id: "${id}"})-[r]-(b) RETURN r, a, b`)
    return result.records.map(i => i.get("b").properties)
}

export default {
    findAll,
    findById,
    create,
    findByIdAndUpdate,
    findByIdAndDelete,
    createRelation,
    deleteRelation,
    getAllProductsOfCategory
}
