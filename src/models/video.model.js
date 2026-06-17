import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // mongoose-aggregate-paginate-v2 is a plugin for Mongoose that adds pagination capabilities to Mongoose's aggregate function. It allows you to easily paginate the results of an aggregation query, which can be useful when dealing with large datasets. By using this plugin, you can specify the page number and the number of items per page, and it will return the appropriate subset of results along with metadata about the total number of pages and items.

const videoSchema = new mongoose.Schema({

   videoFile: {
    type: String, // URL to the video file
    required: true,
    },
    thumbnail: {
        type: String, // URL to the thumbnail image
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, // Duration of the video in seconds
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, {timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)  //

export const Video = mongoose.model('Video', videoSchema)