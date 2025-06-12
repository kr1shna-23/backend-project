import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))    // rec data from only designated frontend host

app.use(express.json({limit: "16kb"}))  //recv data from file

app.use(express.urlencoded({extended: true, limit: "16kb"}))  // recv data from url 

app.use(express.static("public"))  //this public is folder name, where we can store any docx

app.use(cookieParser())


export {app}