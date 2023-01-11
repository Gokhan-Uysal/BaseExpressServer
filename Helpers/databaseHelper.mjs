import {MongoClient} from "mongodb"

export class DatabaseHelper{
    client
    db
    constructor(url, dbName){
        this.client = new MongoClient(url);
        this.db = this.client.db(dbName)
    }

    //Mongodb Crud Ops
    async insertOneItem(collection , item){
        let insertId = await collection.insertOne(item)
        return insertId
    }

    async findOneItem(collection, query){
        let foundItem = await collection.findOne(query)
        return foundItem
    }

    async updateOneItem(collection, query , newQuery){
        let updateResp = await collection.updateOne(query, newQuery)
        return updateResp
    }

    async deleteOneItem(collection, query){
        let deleteResp = await collection.deleteOne(query)
        return deleteResp
    }

    async closeDbConnection(){
        return await this.getClient().close()
    }
}