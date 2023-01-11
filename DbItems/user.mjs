export class User{
    constructor(_id, name, surname, email, age, isVerified, isEnable){
         this._id = _id
         this.name = name
         this.surname = surname
         this.email = email
         this.age = age
         this.isVerified = isVerified
         this.isEnable = isEnable
    }
}


export function convertToUser(reqBody){
    let _id = reqBody._id
    if (_id == undefined){
        _id = null
    }
    let name = reqBody.name
    if (name == undefined){
        throw CustomError.UserPropertyNotFound("name")
    }
    let surname = reqBody.surname
    if (surname == undefined){
        throw CustomError.UserPropertyNotFound("surname")
    }
    let email = reqBody.email
    if (email == undefined){
        throw CustomError.UserPropertyNotFound("email")
    }
    let age = reqBody.age
    if (age == undefined){
        throw CustomError.UserPropertyNotFound("age")
    }
    let isVerified = reqBody.isVerified
    if (isVerified == undefined){
        isVerified = false
    }
    let isEnable = reqBody.isEnable
    if (isEnable== undefined){
        isEnable = false
    }
    let newUser = new User(_id, name, surname, email, age, isVerified, isEnable)
    return newUser
}
