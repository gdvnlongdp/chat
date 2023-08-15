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
const friend_model_1 = __importDefault(require("../../models/friend-model"));
function getRequestedList(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            const requestedList = yield friend_model_1.default.find({
                recipient: req.user.id,
                status: 1,
            }).populate({
                path: "requester",
                populate: {
                    path: "profile",
                },
                select: "-friends",
            });
            res.json({
                status: true,
                message: "Lấy danh sách được gửi yêu cầu kết bạn thành công",
                requestedList,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getRequestedList;
