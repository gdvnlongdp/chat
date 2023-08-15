import mongoose from "mongoose";
import INotification from "./interfaces/notification";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "Notification", timestamps: true }
);

const NotificationModel = mongoose.model<INotification>(
  "notification",
  notificationSchema
);

export default NotificationModel;
