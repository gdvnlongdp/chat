import mongoose from "mongoose";
import IDevice from "./interfaces/device";

const deviceSchema = new mongoose.Schema<IDevice>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      unique: true,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { collection: "Device", timestamps: true }
);

const DeviceModel = mongoose.model("device", deviceSchema);

export default DeviceModel;
