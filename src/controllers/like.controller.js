import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const query = {
        Video: videoId,
        LikedBy: req.user._id,
    }

    const existingLike = await Like.findOne(query)

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked")
        )
    }

    const newLike = await Like.create(query)
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, like: newLike }, "Video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format")
    }

    const query = {
        comment: commentId,
        LikedBy: req.user?._id,
    }

    const existingLike = await Like.findOne(query)

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"))
    }

    const newLike = await Like.create(query)
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, like: newLike }, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format")
    }

    const query = {
        tweet: tweetId,
        LikedBy: req.user?._id,
    }

    const existingLike = await Like.findOne(query)

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"))
    }

    const newLike = await Like.create(query)
    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, like: newLike }, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({
        LikedBy: req.user?._id,
        Video: { $exists: true, $ne: null },
    }).populate({
        path: "Video",
        populate: {
            path: "owner",
            select: "username fullName avatar",
        },
    })

    const likedVideos = likes.map((like) => like.Video)

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
}
