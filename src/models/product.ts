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
const session = driver.session({ database });

const findAll = async () =>{
    const result = await session.run(`Match (u:Product) return u`)
    return result.records.map(i=>i.get('u').properties)
}

const findById = async (id: string) =>{
    const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) return u limit 1`)
    return result.records[0].get('u').properties
}
const create = async (product: Product) =>{
    const unique_id = nanoid(8)
    await session.run(`CREATE (u:Product {_id : '${unique_id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"}) return u`)
    return await findById(unique_id)
}
const findByIdAndUpdate = async (id: string, product: Product) =>{
    const result = await session.run(`MATCH (u:Product {_id : '${id}'}) SET u = {_id: '${product._id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"} return u`)
    return result.records[0].get('u').properties
}
const findByIdAndDelete = async (id: string) =>{
    await session.run(`MATCH (u:Product {_id : '${id}'}) DETACH DELETE u`)
    return await findAll()
}

const getProductsByCategory = async (id: string) =>{
    const result = await session.run(`MATCH (u:Product {_id: "${id}"})<-[:HAS_PRODUCT]-(c) return c`)
    return result.records.map(i=>i.get('c').properties)
}

const addProductToCategory = async (product_id: string, category_id: string) =>{
    await session.run(`MATCH (u:Product {_id: "${product_id}"}), (c:Category {_id: "${category_id}"}) CREATE (c)-[:HAS_PRODUCT]->(u)`)
    return await getProductsByCategory(category_id)
}

const removeProductFromCategory = async (product_id: string, category_id: string) =>{
    await session.run(`MATCH (u:Product {_id: "${product_id}"})<-[r:HAS_PRODUCT]-() DELETE r`)
    return await getProductsByCategory(category_id)
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
