import mongoose from "mongoose";
import IDeviceInfo from "./interfaces/device-info";

const deviceInfoSchema = new mongoose.Schema<IDeviceInfo>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      unique: true,
      required: true,
    },
    imei: {
      type: String,
      // unique: true,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    mac: {
      type: String,
    },
    device: {
      type: String,
    },
    token: {
      type: String,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: "3d" },
    },
  },
  { collection: "Device Info", timestamps: true }
);

const DeviceInfoModel = mongoose.model("device-info", deviceInfoSchema);

export default DeviceInfoModel;
