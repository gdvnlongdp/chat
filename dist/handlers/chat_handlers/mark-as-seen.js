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
const conversation_read_by_user_model_1 = __importDefault(require("../../models/conversation-read-by-user-model"));
function markAsSeen(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ràng buộc đầu vào
            const errs = (0, express_validator_1.validationResult)(req);
            if (!errs.isEmpty()) {
                const err = {
                    name: "Lỗi ràng buộc đầu vào",
                    statusCode: 403,
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
            // Đánh dấu đã đọc bởi ai đó
            const date = new Date();
            date.setHours(date.getHours() + 7);
            const conversationReadByUser = yield conversation_read_by_user_model_1.default.findOneAndUpdate({
                conversationId: req.params.conversationId,
                userId: req.user.id,
            }, { $set: { readAt: date, __v: 0 } }, { new: true, upsert: true });
            // Tìm kiếm conversation
            const converation = yield conversation_model_1.default.findOneAndUpdate({
                _id: req.params.conversationId,
                members: req.user.id,
            }, {
                $pull: {
                    unread: req.user.id,
                },
            }, { new: true });
            if (!(converation === null || converation === void 0 ? void 0 : converation.conversationReadByUser.includes(conversationReadByUser.id.toString()))) {
                yield (converation === null || converation === void 0 ? void 0 : converation.updateOne({
                    $addToSet: { conversationReadByUser: conversationReadByUser.id },
                }));
                yield (converation === null || converation === void 0 ? void 0 : converation.save());
            }
            if (!converation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 400,
                    message: "Không có quyền truy cập hộp thoại này",
                };
                throw err;
            }
            // Ok
            res.json({
                status: true,
                message: "Đánh dấu đã đọc tin nhắn thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = markAsSeen;
