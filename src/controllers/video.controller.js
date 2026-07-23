import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const pipeline = []

    // 1. Filter by owner (User ID) if provided
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User ID")
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    // 2. Filter by search query (matching title or description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        })
    }

    // 3. Filter to only show published videos
    pipeline.push({
        $match: {
            isPublished: true
        }
    })

    // 4. Sort the results dynamically
    const sortStage = {}
    if (sortBy && sortType) {
        sortStage[sortBy] = sortType === "asc" ? 1 : -1
        pipeline.push({
            $sort: sortStage
        })
    }

    // 5. Lookup user details of the owner
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        }
    )

    // 6. Reshape the response object using projection
    pipeline.push({
        $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            isPublished: 1,
            owner: "$ownerDetails",
            createdAt: 1,
            updatedAt: 1
        }
    })

    // Define options for aggregate pagination
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    // Paginate using the model plugin
    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos retrieved successfully"))
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    // 1. Check if video file is present in the request
    if ([title, description].some((fieldId) => fieldId?.trim() === "")) {
        throw new ApiError(400, "Title and description are required")
    }

    // 2. Get local file paths from multer
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    //3. Upload to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    //4. Check if uploads were successful
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Error uploading video file or thumbnail")
    }

    // 5. Create the video document in the database
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id,
        isPublished: true
    })
    const createdVideo = await Video.findById(video._id)
    if (!createdVideo) {
        throw new ApiError(400, "Something went woring while publishing the video")
    }
    // 6. Return success response
    return res
        .status(201)
        .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //1. Check for valid video ID format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format")

    }

    //2. fetch video and populate owner details(username, fullname, avatar)
    const video = await Video.findById(videoId).populate(
        "owner",
        "username fullName avatar"
    )

    // 3. Check if video exists
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Track views and watch history for the authenticated viewer
    video.views = (video.views || 0) + 1
    await video.save({ validateBeforeSave: false })

    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: video._id },
        })
    }

    // 4. Return the video
    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format")
    }

    if (!title || !description || title.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "Title and description are required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Authorized the request 
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to update video")
    }

    const thumbnailLocalPath = req.file?.path || req.files?.thumbnail[0]?.path;

    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!thumbnail.url) {
            throw new ApiError(400, "Error uploading thumbnail")
        }
    }

    //Delete old thumbnail
    if (video.thumbnail && thumbnail?.url) {
        await deleteFromCloudinary(video.thumbnail)

        video.thumbnail = thumbnail?.url
    }

    video.title = title
    video.description = description

    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video?.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to delete video")
    }

    if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile, "video")
    }

    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image")
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id format")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthroized to toggle publish status for this video")
    }

    video.isPublished = !video.isPublished // Toggle the publish status

    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, { isPublished: video.isPublished }, "Video publish status toggled successfully"))


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
