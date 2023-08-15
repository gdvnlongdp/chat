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
const user_model_1 = __importDefault(require("../../models/user-model"));
function leaveGroup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { conversationId } = req.params;
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
            const conversation = yield conversation_model_1.default.findOne({
                _id: conversationId,
                members: req.user.id,
            });
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 400,
                    message: "Không tìm thấy hộp thoại",
                };
                throw err;
            }
            if (conversation.type !== "group") {
                const err = {
                    name: "Không phải hộp thoại nhóm",
                    statusCode: 400,
                    message: "Không phải hộp thoại nhóm",
                };
                throw err;
            }
            if (!conversation.members.includes(req.user.id)) {
                const err = {
                    name: "Không có quyền truy cập",
                    statusCode: 400,
                    message: "Không có quyền trong hộp thoại này",
                };
                throw err;
            }
            // Kiểm tra bạn phải là chủ phòng không, nếu là chủ phòng
            // Không được rời phòng
            if (conversation.creator.toString() === req.user.id.toString()) {
                const err = {
                    name: "Không được rời phòng",
                    statusCode: 400,
                    message: "Bạn là chủ phòng, chủ phòng không được phép rời phòng",
                };
                throw err;
            }
            // Tiến hành rời phòng
            yield conversation.update({
                $pull: {
                    members: req.user.id,
                    admins: req.user.id,
                },
            });
            yield conversation.save();
            yield user_model_1.default.findByIdAndUpdate(req.user.id, {
                $pull: { conversations: conversation.id },
            });
            // Ok
            res.json({
                status: true,
                message: "Rời phòng thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = leaveGroup;
