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
const relationship_model_1 = __importDefault(require("../../models/relationship-model"));
function getFriendList(req, res, next) {
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
            // Tiến hành lâý danh sách bạn bè từ hệ thống
            const friendList = yield relationship_model_1.default.find({
                $or: [{ relatingUser: req.user.id }, { relatedUser: req.user.id }],
                blockedBy: { $ne: req.user.id },
            }).populate({
                path: "relatedUser",
                populate: {
                    path: "profile",
                },
            });
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Lấy danh sách bạn bè thành công",
                friendList,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getFriendList;
