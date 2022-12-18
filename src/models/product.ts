import { nanoid } from 'nanoid';
import {Product} from "types/product";
import moment from "moment";

const neo4j = require('neo4j-driver');
require('dotenv').config()
const {
    url,
    db_username,
    db_password,
    database,
} = process.env
const driver = neo4j.driver(url, neo4j.auth.basic(db_username, db_password));

const findAll = async () =>{
    const session = driver.session({database: database})
    try {
        const result = await session.run(`Match (u:Product) return u`)
        return result.records.map(i=>i.get('u').properties)
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}

const findById = async (id: string) =>{
    const session = driver.session({database: database})
    try {
        const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) return u limit 1`)
        return result.records[0].get('u').properties
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}
const create = async (product: Product) =>{
    const session = driver.session({database: database})
    try {
        const unique_id = nanoid(8)
        await session.run(`CREATE (u:Product {_id : '${unique_id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"}) return u`)
        await session.run(`MATCH (u:Product {_id : '${unique_id}'}), (c:Products {name: "Products"}) CREATE (c)-[:HAS_PRODUCT]->(u)`)
        return await findById(unique_id)
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}
const findByIdAndUpdate = async (id: string, product: Product) =>{
    const session = driver.session({database: database})
    try {
        const result = await session.run(`MATCH (u:Product {_id : '${id}'}) SET u = {_id: '${product._id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"} return u`)
        return result.records[0].get('u').properties
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}
const findByIdAndDelete = async (id: string) =>{
    const session = driver.session({database: database})
    try {
        await session.run(`MATCH (u:Product {_id : '${id}'}) DETACH DELETE u`)
        return await findAll()
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}

const getProductsByCategory = async (id: string) =>{
    const session = driver.session({database: database})
    try {
        const result = await session.run(`MATCH (u:Product {_id: "${id}"})<-[:HAS_PRODUCT]-(c) return c`)
        return result.records.map(i=>i.get('c').properties)
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}

const addProductToCategory = async (product_id: string, category_id: string) =>{
    const session = driver.session({database: database})
    try {
        await session.run(`MATCH (u:Product {_id: "${product_id}"}), (c:Category {_id: "${category_id}"}) CREATE (c)-[:HAS_PRODUCT]->(u)`)
        return await getProductsByCategory(category_id)
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}

const removeProductFromCategory = async (product_id: string, category_id: string) =>{
    const session = driver.session({database: database})
    try {
        await session.run(`MATCH (u:Product {_id: "${product_id}"})<-[r:HAS_PRODUCT]-() DELETE r`)
        return await getProductsByCategory(category_id)
    } catch (e) {
        console.log(e)
    } finally {
        await session.close()
    }
}

export default {
    findAll,
    findById,
    create,
    findByIdAndUpdate,
    findByIdAndDelete,
    getProductsByCategory,
    addProductToCategory,
    removeProductFromCategory
}
