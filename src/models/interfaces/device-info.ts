import mongoose from "mongoose";

interface IDeviceInfo {
  userId: mongoose.Types.ObjectId;
  imei: string;
  ip: string;
  mac: string;
  token: string;
  device: string;
  expireAt?: Date;
}

export default IDeviceInfo;
