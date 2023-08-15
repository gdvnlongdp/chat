import mongoose from "mongoose";

interface IFriend {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: number;
}

export default IFriend;
