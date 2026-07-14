import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// ==========================================
// 1. Create a Tweet
// ==========================================
const createTweet = asyncHandler(async (req, res) => {
    // Step 1: Extract the content of the tweet from request body
    const { content } = req.body

    // Step 2: Validate if the content is provided and not just empty spaces
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required")
    }

    // Step 3: Create the tweet in database. 
    // The owner field is assigned to the current logged-in user's ID (req.user?._id)
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    // Step 4: Verify if tweet document creation was successful
    if (!tweet) {
        throw new ApiError(500, "Internal Server Error: Failed to create tweet")
    }

    // Step 5: Return the created tweet in api response with status 201 (Created)
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

// ==========================================
// 2. Get User Tweets
// ==========================================
const getUserTweets = asyncHandler(async (req, res) => {
    // Step 1: Extract userId from request params (URL)
    const { userId } = req.params

    // Step 2: Validate if the provided userId is a valid MongoDB ObjectId format
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID format")
    }

    // Step 3: Check if the user exists in database to avoid searching for inactive/invalid accounts
    const userExists = await User.findById(userId)
    if (!userExists) {
        throw new ApiError(404, "User not found")
    }

    // Step 4: Search the tweets collection for all tweets owned by this userId
    // Sort by createdAt descending (-1) to get the most recent tweets first
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })

    // Step 5: Return the list of user tweets in response
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

// ==========================================
// 3. Update a Tweet
// ==========================================
const updateTweet = asyncHandler(async (req, res) => {
    // Step 1: Extract tweetId from request params and new content from body
    const { tweetId } = req.params
    const { content } = req.body

    // Step 2: Validate if tweetId is a valid MongoDB ObjectId format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID format")
    }

    // Step 3: Validate if content exists and is not just empty spaces
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required to update tweet")
    }

    // Step 4: Find the tweet in the database by its ID
    const tweet = await Tweet.findById(tweetId)

    // Step 5: If the tweet does not exist, throw 404
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Step 6: Authorization check - compare tweet owner ID with the request user ID
    // We convert both to string for strict comparison
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this tweet")
    }

    // Step 7: Update the content field and save the document
    tweet.content = content
    await tweet.save({ validateBeforeSave: false })

    // Step 8: Return success response containing the updated tweet
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

// ==========================================
// 4. Delete a Tweet
// ==========================================
const deleteTweet = asyncHandler(async (req, res) => {
    // Step 1: Extract tweetId from request params
    const { tweetId } = req.params

    // Step 2: Validate if tweetId is a valid MongoDB ObjectId format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID format")
    }

    // Step 3: Find the tweet in the database by its ID
    const tweet = await Tweet.findById(tweetId)

    // Step 4: If the tweet does not exist, throw 404
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Step 5: Authorization check - ensure only the owner can delete the tweet
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this tweet")
    }

    // Step 6: Delete the tweet document from database
    await Tweet.findByIdAndDelete(tweetId)

    // Step 7: Return success response with empty data object
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
