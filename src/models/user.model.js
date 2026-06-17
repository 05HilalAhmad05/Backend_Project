import mongoose from 'mongoose';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
   
     username: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,    
        trim: true
     },
     email: {   
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
     }, 
     fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
     },
     avatar: {
        type: String, // URL to the user's avatar image
        required: true,
     },
     coverImage: {
        type: String, // URL to the user's cover image
     },
     password: {
        type: String,
        required: [true, 'Password is required'],
     },
     refreshToken: {
        type: String,
     },

        
     

}, 
{timestamps: true})

userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
        }
    )
}

export const User = mongoose.model('User', userSchema)