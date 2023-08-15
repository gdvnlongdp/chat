import mongoose from "mongoose";

interface IAttachment {
  conversation: mongoose.Types.ObjectId;
  filename: string;
  url: string;
  size: number;
  resourceType: string;
}

export default IAttachment;
