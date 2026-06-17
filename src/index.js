// import dotenv from 'dotenv'
// dotenv.config(); this dot env is replace with -r dotenv/config in package.json file to load env variables before running the app
import app from "./app.js"


import connectDB from "./db/connection.js";




    
    
    
    
    connectDB()
    .then(()=>{
      app.listen(process.env.PORT || 6000, () => {
        console.log(`Server is running on port ${process.env.PORT || 6000}`);
      });
    })
    .catch((error) => {
      console.log("MongoDB connection failed", error)
    })
    
    
    
    
    
    
    
    
  
  
  // this approach is used to load directly database in index.js 
  
  // import mongoose, { mongo } from "mongoose";
    // import { DB_Name } from "./constant"; 
    // import express from "express";
    // const app = express();

    // (async ()=>{
    //     try {
    //         await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`, )
    //         app.on("error", (error) => {
    //             console.error("Error", error);
    //             throw error;
    //         });
    //         app.listen(process.env.PORT, () => {
    //             console.log(`Server is running on port ${process.env.PORT}`);
    //         });
    //     } catch (error) {
    //         console.error("Error", error);
    //         throw error;
    //     }
    // })()