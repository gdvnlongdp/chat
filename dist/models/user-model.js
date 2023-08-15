"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const userSchema = new mongoose_1.default.Schema({
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
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "conversation",
            required: true,
        },
    ],
    friends: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    ],
    friendRequests: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "friend-request",
            required: true,
        },
    ],
    profile: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "profile",
        required: true,
    },
}, { collection: "User", timestamps: true });
// Khi lưu document, mã hóa mật khẩu sẽ được tiến hành
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        try {
            if (!user.isModified("password")) {
                next();
                return;
            }
            const salt = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
            user.password = hashedPassword;
            next();
        }
        catch (err) {
            logger_1.default.error("Mã hóa mật khẩu thất bại");
            console.log(err);
        }
    });
});
// Hàm kiểm tra password
userSchema.methods = {
    comparePassword: function (candidatePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this;
            try {
                const isMatch = yield bcrypt_1.default.compare(candidatePassword, user.password);
                return isMatch;
            }
            catch (err) {
                logger_1.default.error("Kiểm tra mật khẩu thất bại");
                console.log(err);
                return false;
            }
        });
    },
};
const UserModel = mongoose_1.default.model("user", userSchema);
exports.default = UserModel;
