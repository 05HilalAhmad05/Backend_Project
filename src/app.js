import express from "express"
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors"

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
].filter((origin) => origin && origin !== '*')

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
}))

app.use(express.json({ limit: "18kb" }));
app.use(express.urlencoded({ extended: true, limit: "18kb" }))
app.use(express.static("public"))
app.use(cookieParser())


//Routing work importing
import userRouter from "./routes/user.router.js";
import videoRouter from "./routes/video.router.js";
import tweetRouter from "./routes/tweet.router.js";
import subscriptionRouter from "./routes/subscription.router.js";
import playlistRouter from "./routes/playlist.router.js";
import likeRouter from "./routes/like.router.js"
import healthcheckRouter from "./routes/healthcheck.router.js"
import dashboardRouter from "./routes/dashboard.router.js"
import commentRouter from "./routes/comment.router.js"

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/health", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/comment", commentRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        data: null,
    })
})

export default app;
