import mongoose from "mongoose";

type JwtPayload = {
  id: mongoose.Types.ObjectId;
  profileId: mongoose.Types.ObjectId;
};

export default JwtPayload;
