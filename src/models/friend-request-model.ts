import mongoose from "mongoose";

export const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { collection: "Friend Request", timestamps: true }
);

const FriendRequestModel = mongoose.model(
  "friend-request",
  friendRequestSchema
);

export default FriendRequestModel;
