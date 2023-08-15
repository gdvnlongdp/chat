import mongoose from "mongoose";
import ISticker from "./interfaces/sticker";

const stickerSchema = new mongoose.Schema<ISticker>(
  {
    name: {
      type: String,
    },
    thum: {
      type: String,
    },
    collect: [
      {
        type: String,
      },
    ],
  },
  { collection: "Sticker", timestamps: true }
);

const StickerModel = mongoose.model(
  "sticker",
  stickerSchema
);

export default StickerModel;
