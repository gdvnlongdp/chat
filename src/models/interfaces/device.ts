import mongoose from "mongoose";

interface IDevice {
  userId: mongoose.Types.ObjectId;
  token: string;
}

export default IDevice;
