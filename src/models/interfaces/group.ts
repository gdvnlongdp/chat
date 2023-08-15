import mongoose from "mongoose";

interface IGroup {
  name: string;
  members: mongoose.Types.ObjectId[];
  host: mongoose.Types.ObjectId;
}

export default IGroup;
