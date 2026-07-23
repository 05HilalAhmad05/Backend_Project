import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Playlist description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos: []
    })

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const playlists = await Playlist.find({ owner: userId })

    if (!playlists) {
        throw new ApiError(404, "No playlists found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("videos", "videoFile thumbnail title duration views owner")
        .populate("owner", "username fullName avatar")

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to add video to playlist")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to remove video from playlist")
    }

    const originalLength = playlist.videos.length
    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId.toString())

    if (playlist.videos.length === originalLength) {
        throw new ApiError(400, "Video not found in playlist")
    }

    await playlist.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID format")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to delete playlist")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID format")
    }

    if ((!name || name.trim() === "") && (!description || description.trim() === "")) {
        throw new ApiError(400, "Playlist name or description is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner?.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, "Unauthorized to update playlist")
    }

    if (name && name.trim() === "") {
        throw new ApiError(400, "Playlist name is required")
    }

    if (description && description.trim() === "") {
        throw new ApiError(400, "Playlist description is required")
    }

    if (name && name.trim() !== "") {
        playlist.name = name.trim()
    }

    if (description && description.trim() !== "") {
        playlist.description = description.trim()
    }

    await playlist.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}