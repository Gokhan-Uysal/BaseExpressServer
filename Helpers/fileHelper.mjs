import { captureRejectionSymbol } from "events"
import fs from "fs"
import util from "util"

export class FileHelper{
    readFileAsync = util.promisify(fs.readFile)
    writeFileAsync = util.promisify(fs.writeFile)

    async readFile(pathToFile){
        try{
            return await readFileAsync(pathToFile, 'utf8')
        }
        catch(err){
            console.log(err)
        }
    }

   async  writeFile(pathToFile, item){
        try{
            return await writeFileAsync(pathToFile, item)
        }
        catch(err){
            console.log(err)
        }
    }
}