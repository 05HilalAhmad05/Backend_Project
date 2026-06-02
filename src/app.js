const express = require("express");
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors"


app.use(cors({
    origin: process.env.CORS-Origin,
    credentials: true,
}))

app.use(express.json({limit: "18kb"}));
app.use(express.urlencoded({extended: true, limit: "18kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export default app;