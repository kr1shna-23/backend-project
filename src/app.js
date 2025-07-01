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


// routes import
import userRouter from "./routes/user.route.js"



// routes declaration
app.use("/api/v1/users", userRouter)  // this will give control to userRoute (https://localhost8000/api/v1/users), there we can have multiple like users/register, user/login etc, we dont have to change anything here

export {app}