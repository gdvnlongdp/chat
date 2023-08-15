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
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
const relationship_model_1 = __importDefault(require("../../models/relationship-model"));
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
            // Kiểm tra mối quan hệ bạn bè đã có hay chưa
            const relationship = yield relationship_model_1.default.findOne({
                $or: [
                    { relatingUser: req.user.id, relatedUser: userId },
                    { relatingUser: userId, relatedUser: req.user.id },
                ],
            });
            if (relationship) {
                if (!relationship.blockedBy) {
                    const err = {
                        name: "Đã tồn tại mối quan hệ",
                        statusCode: 400,
                        message: "Đã là bạn bè, không thể kết bạn",
                    };
                    throw err;
                }
                // Nếu người truy cập đang chặn người dùng, bỏ block
                if (relationship.blockedBy === req.user.id) {
                    yield relationship.update({ blockedBy: null });
                    yield relationship.save();
                }
            }
            else {
                // Tiến hành kết bạn và lưu thông tin vào hệ thống
                const newRelationship = new relationship_model_1.default({
                    relatingUser: req.user.id,
                    relatedUser: userId,
                });
                yield newRelationship.save();
                // Sau khi kết bạn, tạo mới cuộc trò chuyện cá nhân
                const newConversation = new conversation_model_1.default({
                    members: [req.user.id, userId],
                    type: "one-to-one",
                    unread: [req.user.id, userId],
                });
                yield newConversation.save();
            }
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: `Kết bạn thành công với người dùng có id là ${userId}`,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = addFriend;
