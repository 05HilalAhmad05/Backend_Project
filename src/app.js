import express from "express"
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors"


app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlists", playlistRouter)

export default app;