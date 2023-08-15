import mongoose from "mongoose";
import IRelationship from "./interfaces/relationship";

const relationshipSchema = new mongoose.Schema<IRelationship>(
  {
    relatingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { collection: "Relationship", timestamps: true }
);

const RelationshipModel = mongoose.model<IRelationship>(
  "relationship",
  relationshipSchema
);

export default RelationshipModel;
