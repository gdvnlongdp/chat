import mongoose from "mongoose";

interface IAPI {
  android: string;
  ios: string;
}

const schema = new mongoose.Schema<IAPI>(
  {
    android: {
      type: String,
    },
    ios: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ApiVersion = mongoose.model("api-version", schema);
