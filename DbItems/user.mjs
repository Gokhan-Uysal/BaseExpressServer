export class User{
    constructor(_id, name, surname, email,password, age, gender, status, isVerified, isEnabled){
         this._id = _id
         this.name = name
         this.surname = surname
         this.email = email
         this.password = password
         this.age = age
         this.gender = gender
         this.status = {
            lastSeen : new Date().getTime(),
            userStatus: status,
            isVerified : isVerified,
            isEnabled : isEnabled
         }

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
    let password = reqBody.password
    if (password == undefined){
        throw CustomError.UserPropertyNotFound("password")
    }
    let age = reqBody.age
    if (age == undefined){
        throw CustomError.UserPropertyNotFound("age")
    }
    let gender = reqBody.gender
    if (gender == undefined){
        throw CustomError.UserPropertyNotFound("gender")
    }
    let status = reqBody.status
    if (status == undefined){
        throw CustomError.UserPropertyNotFound("status")
    }
    let isVerified = reqBody.isVerified
    if (isVerified == undefined){
        isVerified = false
    }
    let isEnabled = reqBody.isEnabled
    if (isEnabled == undefined){
        isEnabled = true
    }

    let newUser = new User(_id, name, surname, email, password, age, gender, status, isVerified, isEnabled)
    return newUser
}
