import mongoose from "mongoose";

interface IFriendRequest {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  status: string;
}

export default IFriendRequest;
