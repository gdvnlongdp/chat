import mongoose from "mongoose";

interface ILocation {
  userId: mongoose.Types.ObjectId;
  ip: string;
  mac: string;
  latitude: number;
  longitude: number;
  device: string;
  token: string;
  createdAt?: Date;
  checked: boolean;
  platform: string;
  // time: Date;
}

export default ILocation;
