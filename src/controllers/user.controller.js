import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

const generateAcessandRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }
   } catch (error) {
     
      throw new ApiError(500, "something went wrong while generating access and refresh tokens")
   }
}


const registerUser = asyncHandler(async (req, res) => {
   // Get user detail from fronted
   //validation check if name or email is empty
   // Check if user is already esisted
   //check for images, for avtar 
   // upload them on cloudinary, avtar
   // create user object - create enty in db
   // remove password and refresh token field from response 
   // check for user creation 
   // return res 

   const { fullName, email, password, username } = req.body

   if (
      [fullName, email, password, username].some((field) => field?.trim() === "")
   ) {
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ email }, { username }]
   })

   if (existedUser) {
      throw new ApiError(400, "User already exists with this email or username")
   }

   const avatarLocalPath = req.files?.avatar?.[0]?.path // it means if there is a file in the avatar field, get the path of the first file, otherwise return undefined
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required")
   }

   console.log("req.files =", req.files)
   console.log("req.body =", req.body)

   const avatar = await uploadOnCloudinary(avatarLocalPath,)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "avatar is required")
   }

   const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: avatar.secure_url,
      coverImage: coverImage?.url || ""

   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken "
   )

   if (!createdUser) {
      throw new ApiError(500, "User registration failed")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
   )



})

const loginUser = asyncHandler(async (req, res) => {
   // get email and password from req.body
   // find that email and password in database
   // check the password if correct
   // access token and refresh token being made
   // send cookies to browser

   const { email, username, password } = req.body

   if (!email && !username) {
      throw new ApiError(400, 'email or username is required')
   }

   const user = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (!user) {
      throw new ApiError(404, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid password')
   }
    
   const {accessToken, refreshToken} = await generateAcessandRefreshTokens(user._id)
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: false, // set to true in production
   }

   return res.
   status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser, accessToken, refreshToken
         },
           "User loggedIn successfully"
      )
   )

})

const logoutUser = asyncHandler( async(req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1 // it means remove the refreshToken field from the user document and means that the user will no longer be able to use the refresh token to get a new access token, effectively logging them out from all devices
         }, 
      },
      {
         new: true // it means that the updated user document will be returned after the update operation is completed, rather than the original document before the update
      }
   )

   const options = {
      httpOnly: true,// it means that the cookie can only be accessed by the server and not by client-side JavaScript, which helps to prevent cross-site scripting (XSS) attacks
      secure: false
   }

   return res // it means that the response will have a status code of 200 (OK), and it will clear the "Access Token" from the client's cookies using the specified options, and it will also clear the "Refresh Token" from the client's cookies using the same options. Finally, it will send a JSON response with a message indicating that the user has been logged out successfully


   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(
      new ApiResponse(200, {}, "User logged out successfully")
   )
})

const refreshAccessToken = asyncHandler(async(req, res) =>{
   const incomingRefreshToken = req.body.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "Unauthorized Request")
   }

  try {
    const decodedToken = jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
    )
 
    const user = await User.findById(decodedToken?._id)
 
    if(!user){
       throw new ApiError(401, "Invalid refresh Token")
    }
 
    if(incomingRefreshToken !== user?.refreshToken){
       throw new ApiError(401, "Refresh token is expired or used")
    }
 
    const options = {
       httpOnly: true,
       secure: false
    }
 
    const {accessToken, newrefreshToken} = await generateAcessandRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
       new ApiResponse(
            200, 
                 {accessToken, refreshToken: newRefreshToken},
                 "Access token refreshed"
       )
    )
  } catch (error) {
   throw new ApiError(401, error?.message || "Invalid refresh Token")
  }
})

const ChangeCurrentPassword = asyncHandler(async(req, res) =>{
   const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(401, "Invalid old password")
   }

   user.password = newPassword
    await  user.save({validateBeforeSave: false})

     return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

 const getCurrentUser = asyncHandler(async(req, res) =>{
   return res
   .status(200)
   .json(
      200,
      req.user,
      "User fetched successfully"
   )
 })

 const updateAccountDetails = asyncHandler(async(req, res) =>{
   const {email, fullName} = req.body

   if(!fullName || !email){
      throw new ApiError(400, "All fields are required")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            email,
            fullName
         }
      },
     {new: true} //it means that the updated user document will be returned after the update operation is completed, rather than the original document before the update
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200, user, "User details updated successfully")
   )
 })

 const updateUserAvatar = asyncHandler(async(req, res) => {
   const avatarLocalPath = req.file?.path

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400, "Error while uploading avatar on cloudinary")
   }
   
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200, user, "User avatar updated successfully")
   )
 })

 const updateUserCoverImage = asyncHandler(async(req, res) => {
   const coverImageLocalPath = req.file?.path 
   if(!coverImageLocalPath){
      throw new ApiError(400, "Cover image file is missing")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
      throw new ApiError(400, "Error while uploading cover image on cloudinary")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      {new: true}
   ).select("-password")

   return res
   .status(200)
   .json(
      new ApiResponse(200, user, "User cover image updated successfully")
   )
 })

export { registerUser, loginUser , logoutUser, refreshAccessToken}
