import fs from "fs"

export class FileHelper{
    readFile(pathToFile){
        return new Promise((resolve, reject) =>{
            fs.readFile(pathToFile, 'utf8' , (err, data) =>{
                if(err != null){
                    reject(err)
                }
                else{
                    resolve(data)
                }
            })
        })
    }

    writeFile(pathToFile, item){
        return new Promise((resolve, reject) =>{
            fs.writeFile(pathToFile, item, (err) =>{
                if (err != null){
                    reject(err)
                }
                else{
                    resolve(true)
                }
            })
        }) 
    }
}