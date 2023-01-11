import {MongoClient} from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const uri = "mongodb+srv://"+process.env.DBUSER+":"+process.env.DBPASSWORD+"@"+process.env.DBPASSWORD2+".mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
export const db = client.db(process.env.DBNAME)

export async function closeDbConnection(){
    return await client.close()
}
