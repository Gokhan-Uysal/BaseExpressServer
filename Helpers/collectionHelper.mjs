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

    async insertManyItems(items){
        if (items.length == 1){
            let inserId = await this.insertOneItem(items[0])
            return inserId
        }
        let insertIds = await this.getCollection().insertMany(items)
        return insertIds
    }

    async findOneItem(query){
        let foundItem = await this.getCollection().findOne(query)
        return foundItem
    }

    async findManyItems(query, limit){
        let foundItems = await this.getCollection().find(query).limit(limit).toArray()
        return foundItems
    }

    async updateOneItem(query , newQuery){
        let updateResp = await this.getCollection().updateOne(query, newQuery)
        return updateResp
    }

    async updateManyItems(query, newQuery){
        let updateResp = await this.getCollection().updateMany(query, newQuery)
        return updateResp
    }

    async deleteOneItem(query){
        let deleteResp = await this.getCollection().deleteOne(query)
        return deleteResp
    }

    async deleteManyItems(query){
        let deleteResp = await this.getCollection().deleteMany(query)
        return deleteResp
    }
    
    async closeDb(){
        let resp = await closeDbConnection()
        return resp
    }
}