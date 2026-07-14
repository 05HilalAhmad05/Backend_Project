import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //the one who is subscript
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // the channel which the user will subscribe channel is also user
        ref: "User"
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)