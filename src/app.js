import express from "express"
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors"


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "18kb"}));
app.use(express.urlencoded({extended: true, limit: "18kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//Routing work importing
import userRouter from "./routes/user.router.js";

//routes declaration
app.use("/api/v1/user", userRouter)

export default app;