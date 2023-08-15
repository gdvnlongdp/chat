import bcrypt from "bcrypt";
import mongoose from "mongoose";
import logger from "../utils/logger";
import IUser from "./interfaces/user";

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "Yêu cầu tên đăng nhập"],
    },
    group: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    requireLocation: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    conversations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "conversation",
        required: true,
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "friend-request",
        required: true,
      },
    ],
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile",
      required: true,
    },
  },
  { collection: "User", timestamps: true }
);

// Khi lưu document, mã hóa mật khẩu sẽ được tiến hành
userSchema.pre("save", async function (next) {
  let user = this;
  try {
    if (!user.isModified("password")) {
      next();
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (err) {
    logger.error("Mã hóa mật khẩu thất bại");
    console.log(err);
  }
});

// Hàm kiểm tra password
userSchema.methods = {
  comparePassword: async function (
    candidatePassword: string
  ): Promise<boolean> {
    const user = this as IUser;
    try {
      const isMatch = await bcrypt.compare(candidatePassword, user.password);
      return isMatch;
    } catch (err) {
      logger.error("Kiểm tra mật khẩu thất bại");
      console.log(err);
      return false;
    }
  },
};

const UserModel = mongoose.model<IUser>("user", userSchema);

export default UserModel;
