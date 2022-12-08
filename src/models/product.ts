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

const findById = async (id) =>{
    const result = await session.run(`MATCH (u:Product {_id : '${id}'} ) return u limit 1`)
    return result.records[0].get('u').properties
}
const create = async (product: Product) =>{
    const unique_id = nanoid(8)
    await session.run(`CREATE (u:Product {_id : '${unique_id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"}) return u`)
    return await findById(unique_id)
}
const findByIdAndUpdate = async (id, product) =>{
    const result = await session.run(`MATCH (u:Product {_id : '${id}'}) SET u = {_id: '${product._id}', name: '${product.name}', manufacturer: "${product.manufacturer}", description: "${product.description}", price: "${product.price}", salePrice: "${product.salePrice}", images: "${product.images}", isAvailable: ${product.isAvailable}, tags: "${product.tags}", characteristic: "${product.characteristics}", created_at: "${product.created_at}", updated_at: "${moment()}"} return u`)
    return result.records[0].get('u').properties
}
const findByIdAndDelete = async (id) =>{
    await session.run(`MATCH (u:Product {_id : '${id}'}) DETACH DELETE u`)
    return await findAll()
}

export default {
    findAll,
    findById,
    create,
    findByIdAndUpdate,
    findByIdAndDelete
}
