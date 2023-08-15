import mongoose from "mongoose";
import ILocation from "./interfaces/location";

const locationSchema = new mongoose.Schema<ILocation>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    ip: {
      type: String,
    },
    mac: {
      type: String,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    device: {
      type: String,
    },
    platform: {
      type: String,
    },
    token: {
      type: String,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "Location",
    timestamps: true,
  }
);

const LocationModel = mongoose.model("location", locationSchema);

export default LocationModel;
