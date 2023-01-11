import { DatabaseHelper } from "./databaseHelper.mjs";

export class CollectionHelper extends DatabaseHelper{

    constructor(url, dbName, collectionName){
        super(url, dbName)
        const collection = super.db.collection(collectionName)
        this.getCollection = () => {return collection}
    }

    async insertUser(item){
        let _id = await super.insertOneItem(this.getUsersCollection(), item)
        return _id
    }
    
    async findUser(query){
        let user = await super.findOneItem(this.getUsersCollection(), query)
        return user
    }
    
    async updateUser(query, newQuery){
        let updateResp = await super.updateOneItem(this.getUsersCollection(), query, newQuery)
        return updateResp
    }
    
    async deleteUser(query){
        let deleteResp = await super.deleteOneItem(this.getUsersCollection(), query)
        return deleteResp
    }
}