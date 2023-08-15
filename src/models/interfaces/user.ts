import mongoose, { Types } from "mongoose";

interface IUser {
  username: string;
  group: string;
  email: string;
  phone: string;
  password: string;
  profile: mongoose.Types.ObjectId;
  online: boolean;
  requireLocation?: boolean;
  conversations: mongoose.Types.ObjectId[];

  friends: mongoose.Types.ObjectId[];
  friendRequests: mongoose.Types.ObjectId[];

  comparePassword: comparePasswordFunction;
}

type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;

export default IUser;
