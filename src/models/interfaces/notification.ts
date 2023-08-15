import mongoose from "mongoose";

interface INotification {
  message: string;
  type: string;
  userId: mongoose.Types.ObjectId;
  read: boolean;
}

export default INotification;
