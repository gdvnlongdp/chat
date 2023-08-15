import mongoose from "mongoose";

interface IRelationship {
  relatingUser: mongoose.Types.ObjectId;
  relatedUser: mongoose.Types.ObjectId;
  blockedBy: mongoose.Types.ObjectId;
}

export default IRelationship;
