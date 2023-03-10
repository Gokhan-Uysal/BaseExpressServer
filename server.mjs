import express from "express"
import bodyParser from "body-parser"
import dotenv from "dotenv"

import {User, convertToUser} from "./DbItems/user.mjs"
import { CustomError } from "./Customs/CustomError.mjs"
import { PasswordHelper } from "./Helpers/passwordHelper.mjs"
import { EmailHelper } from "./Helpers/emailHelper.mjs"
import { FileHelper } from "./Helpers/fileHelper.mjs"
import { CollectionHelper } from "./Helpers/collectionHelper.mjs"

//.Env config
dotenv.config();

//MongoDb collections
const usersCollection = new CollectionHelper("users")

//Helpers config
const fileHelper = new FileHelper()
const emailHelper = new EmailHelper(process.env.GMAILUSER, process.env.GMAILKEY)
const adminHelper = new EmailHelper(process.env.ADMINGMAILUSER, process.env.ADMINGMAILKEY)
const passwordHelper = new PasswordHelper(12)

//Auth config
let startTime
let wrongAuthCount = 0
let requestCount = 0
let maxRequestCount = 100
let maxWrongAuthCount = 5
let isInitialReq = true
let isAuthMailSent = false
const timePadding = 1 //In minutes

//Express app and routers
const app = express()
const admin = express.Router()
const getReq = express.Router()
const insertReq = express.Router()
const updateReq = express.Router()
const deleteReq = express.Router()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(bodyParser.json())

//Express config
const PORT = process.env.PORT
const logger = (req, res, next) =>{
    requestCount ++
    if (isInitialReq){
        startTime = new Date().getTime()
        isInitialReq = false
        next()
        return
    }
    
    const timeElapsedMs = new Date().getTime() - startTime
    const timeElapsedInMinute = parseInt(timeElapsedMs / 60000)

    if (requestCount <= maxRequestCount){
        if(timeElapsedInMinute > timePadding){
            isInitialReq = true
            requestCount = 0
        }
        next()
    }
    else{
        if(timeElapsedInMinute <= timePadding){
            next(CustomError.ReachedRequestCallCount(requestCount - 1))
            return
        }
        next()
    }
}

const authenticator = async (req , res , next) =>{
    try{
        if (await passwordHelper.comparePassword(req.headers.serverkey, process.env.SERVERKEY)){
            next()
            return
        }
        else{
            wrongAuthCount ++
            next(CustomError.AuthenticationError)
            if(wrongAuthCount > maxWrongAuthCount && !isAuthMailSent){
                isAuthMailSent = true
                await createAndSendNewPassword()
            }
        }
    }
    catch(err){
        next(err)
    }
}

const errorHandler = (err, req, res, next) => {
    console.log(err.message)
    res.status(500).send(`Something went wrong: ${err.message}`)
}

app.use(logger)
app.use(authenticator);
app.use(errorHandler)
app.use("/admin" , admin)
app.use("/get", getReq)
app.use("/insert", insertReq)
app.use("/update", updateReq)
app.use("/delete", deleteReq)

const server = app.listen(PORT , () =>{
    console.log("Server is running on port " + PORT);
})

admin.post("/reset-password" , async (req, res, next) =>{
    try{
        let body = req.body
        let newPassowrd = body.password
        let hashedPassword = await passwordHelper.hashPassword(newPassowrd)
        process.env.SERVERKEY = hashedPassword
        dotenv.config()
        res.sendStatus(200)
    }
    catch(err){
        next(err)
    }

}, errorHandler)

admin.get("/close-server" , (req, res, next) =>{
    try{
        server.close()
        res.sendStatus(200)
    }
    catch(err){
        next(err)
    }
},errorHandler)

admin.get('/start-server', (req, res) => {
    if (server && server.listening) {
        res.status(200).send('Server already running');
    } 
    else {
        server = app.listen(PORT, () => {
            console.log('Server started on port 3000');
            res.status(200).send('Server started');
        });
    }
});


app.get("/" , (req , res) =>{
    res.sendStatus(200)
})

insertReq.post("/user" , async (req, res, next) =>{
    try{
        let body = req.body
        let user = convertToUser(body)
        user.password = await passwordHelper.hashPassword(user.password)
        let _id = await usersCollection.insertOneItem(user)
        res.send(_id)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

insertReq.post("/users", async (req, res, next) =>{
    try{
        let body = req.body
        let userList = []
        body.forEach(userData => {
            let user = convertToUser(userData)
            userList.push(user)
        });
        let _id = await usersCollection.insertManyItems(userList)
        res.send(_id)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

getReq.post("/user" , async (req, res, next) =>{
    try{
        let query = req.body
        let user = await usersCollection.findOneItem(query)
        if (user == null){
            throw CustomError.DbItemNotFound("user")
        }
        res.send(user)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

getReq.post("/users", async (req, res, next) =>{
    try{
        let query = req.body
        let userList = await usersCollection.findManyItems(query, 10)
        if (userList.length == 0){
            throw CustomError.DbItemNotFound("users")
        }
        userList.forEach(user => {
            user.password = null
        })

        res.send(userList)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

updateReq.post("/user" , async (req, res, next) =>{
    try{
        let query = req.body.query
        let newValue = req.body.newQuery
        let newQuery = {
            $set: newValue
        }
        let updateResp = await usersCollection.updateOneItem(query, newQuery)
        res.send(updateResp)
    }
    catch(err){
        next(err)
        return
    }
},errorHandler)

updateReq.post("/users", async (req, res, next) =>{
    try{
        let query = req.body.query
        let newValue = req.body.newQuery
        let newQuery = {
            $set: newValue
        }
        let updateResp = await usersCollection.updateManyItems(query, newQuery)
        res.send(updateResp)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

deleteReq.post("/user", async (req, res, next) =>{
    try{
        let query = req.body
        let deleteResp = await usersCollection.deleteOneItem(query)
        res.send(deleteResp)
    }
    catch(err){
        next(err)
        return
    }
},errorHandler)

deleteReq.post("/user", async (req, res, next) =>{
    try{
        let query = req.body
        let deleteResp = await usersCollection.deleteManyItems(query)
        res.send(deleteResp)
    }
    catch(err){
        next(err)
        return
    }
},errorHandler)

app.post("/inform/user" , async (req, res, next) => {
    try{
        let body = req.body
        let to = body.to
        let subject = body.subject
        let text = body.text
        let html = body.html

        let email = emailHelper.createEmailWithHtml(to, subject, text, html)
        let emailResp = await emailHelper.sendMail(email)
        res.send(emailResp)
    }
    catch(err){
        next(err)
        return
    }
},errorHandler)

//Authentication
async function createAndSendNewPassword(){
    let newPassword = await createNewPassword()
    let emailResp = await sendNewPassword(newPassword)
    return emailResp
}

async function createNewPassword(){
    let newPassword = passwordHelper.createPassword()
    let newHashedPassword = await passwordHelper.hashPassword(newPassword)
    process.env.SERVERKEY = newHashedPassword
    return newPassword
}

async function sendNewPassword(newPassword){
    let email = adminHelper.createEmail(adminHelper.getGmailUser(), 
        "Secutiy Alert", 
        `Wrong authentication with count: ${wrongAuthCount}\n`+
        `New password is: "${newPassword}"`
        )
    let emailResp = await adminHelper.sendMail(email)
    return emailResp
}