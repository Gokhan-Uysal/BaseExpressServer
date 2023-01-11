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
const fileHelper = new FileHelper()
const env = dotenv.parse(await fileHelper.readFile("./.env"))

//MongoDb config
const url = "mongodb+srv://"+env.DBUSER+":"+env.DBPASSWORD+"@"+env.DBPASSWORD2+".mongodb.net/?retryWrites=true&w=majority"

//Helpers config
const usersCollection = new CollectionHelper(url, env.DBNAME, "users")
const emailHelper = new EmailHelper(env.GMAILUSER, env.GMAILKEY)
const adminHelper = new EmailHelper(env.ADMINGMAILUSER, env.ADMINGMAILKEY)
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

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(bodyParser.json())

//Express config
const PORT = env.PORT
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

const errorHandler = (err, req, res, next) => {
    console.log(err.message)
    res.status(500).send('Something went wrong: ' + err)
}

app.use(logger)
app.use(authenticator);
app.use(errorHandler)
app.use("/admin" , admin)
admin.use(authenticator)

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

app.post("/insert/user" , async (req, res, next) =>{
    try{
        let user = convertToUser(req.body)
        let _id = await insertUser(user)
        res.send(_id)
    }
    catch(err){
        next(err)
        return
    }
}, errorHandler)

app.post("/get/user" , async (req, res, next) =>{
    try{
        let query = req.body
        let user = await findUser(query)
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

app.post("/update/user" , async (req, res, next) =>{
    try{
        let query = req.body.query
        let newValue = req.body.newQuery
        let newQuery = {
            $set: newValue
        }
        let updateResp = await updateUser(query, newQuery)
        res.send(updateResp)
    }
    catch(err){
        next(err)
        return
    }
},errorHandler)

app.post("/delete/user", async (req, res, next) =>{
    try{
        let query = req.body
        let deleteResp = await deleteUser(query)
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