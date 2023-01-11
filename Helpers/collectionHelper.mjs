import {db, closeDbConnection} from "./databaseHelper.mjs"
export class CollectionHelper{

    constructor(collectionName){
        const collection = db.collection(collectionName)
        this.getCollection = () => {return collection}
    }

    //Mongodb Crud Ops
    async insertOneItem(item){
        let insertId = await this.getCollection().insertOne(item)
        return insertId
    }

    async findOneItem(query){
        let foundItem = await this.getCollection().findOne(query)
        return foundItem
    }

    async updateOneItem(query , newQuery){
        let updateResp = await this.getCollection().updateOne(query, newQuery)
        return updateResp
    }

    async deleteOneItem(query){
        let deleteResp = await this.getCollection().deleteOne(query)
        return deleteResp
    }
    

    async closeDb(){
        let resp = await closeDbConnection()
        return resp
    }
}