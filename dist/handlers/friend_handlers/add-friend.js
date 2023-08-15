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
const express_validator_1 = require("express-validator");
const friend_request_model_1 = __importDefault(require("../../models/friend-request-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function addFriend(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.body;
        try {
            // Ràng buộc đầu vào
            const errs = (0, express_validator_1.validationResult)(req);
            if (!errs.isEmpty()) {
                const err = {
                    name: "Lỗi ràng buộc đầu vào",
                    statusCode: 400,
                    message: errs.array()[0].msg,
                };
                throw err;
            }
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            const friendRequest = new friend_request_model_1.default({
                from: req.user.id,
                to: userId,
            });
            const friendRequestPopulated = yield friend_request_model_1.default.populate(friendRequest, [
                {
                    path: "to",
                    populate: {
                        path: "profile",
                    },
                },
                {
                    path: "from",
                    populate: {
                        path: "profile",
                    },
                },
            ]);
            yield user_model_1.default.findByIdAndUpdate(req.user.id, { $push: { friendRequests: friendRequest.id } }, { new: true });
            const test = yield user_model_1.default.findByIdAndUpdate(userId, { $push: { friendRequests: friendRequest.id } }, { new: true });
            yield friendRequest.save();
            res.json({
                status: true,
                message: "Gửi kết bạn thành công",
                friendRequest: friendRequestPopulated,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = addFriend;
