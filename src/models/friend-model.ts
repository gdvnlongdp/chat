import mongoose from "mongoose";
import IFriend from "./interfaces/friend";

const friendSchema = new mongoose.Schema<IFriend>(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3], // Kết bạn, Gửi kết bạn, Đang chờ, Bạn bè
      require: true,
    },
  },
  { collection: "Friend", timestamps: true }
);

const FriendModel = mongoose.model<IFriend>("friend", friendSchema);

export default FriendModel;
