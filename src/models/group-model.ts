import mongoose from "mongoose";
import IGroup from "./interfaces/group";

const groupSchema = new mongoose.Schema<IGroup>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { collection: "Group", timestamps: true }
);

const GroupModel = mongoose.model<IGroup>("group", groupSchema);

export default GroupModel;
