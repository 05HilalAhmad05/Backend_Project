import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }
    if (channelId.toString() === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const channelExists = await User.findById(channelId)

    if (!channelExists) {
        throw new ApiError(404, "Channel not found")
    }

    const credentials = {
        subscriber: req.user._id,
        channel: channelId
    }

    const subscription = await Subscription.findOne(credentials)

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id)
        return res.status(200).json(new ApiResponse(200, {}, "unsubscribed successfully"))
    } else {
        await Subscription.create(credentials)
        return res.status(200).json(new ApiResponse(200, {}, "subscribed successfully"))
    }


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const channelExists = await User.findById(channelId)

    if (!channelExists) {
        throw new ApiError(404, "Channel not found")
    }

    const subscriptions = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username fullName avatar email")

    const subscriberList = subscriptions.map(sub => sub.subscriber)

    return res.status(200).json(new ApiResponse(200,
        subscriberList,
        "Subscriber list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID format")
    }

    const subscriberExists = await User.findById(subscriberId)
    if (!subscriberExists) {
        throw new ApiError(404, "Subscriber does not exist")
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username fullName avatar email")

    const subscribedChannels = subscriptions.map(sub => sub.channel)

    return res.status(200).json(new ApiResponse(200,
        subscribedChannels,
        "Subscribed channels list fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}