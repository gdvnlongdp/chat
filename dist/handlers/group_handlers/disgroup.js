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
function disGroup(req, res, next) {
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
                type: "group",
            });
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 400,
                    message: "Thao tác thất bại",
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
            // Kiểm tra người dùng này là ai, (chủ phòng, phó phòng hay user thường)
            let role = "";
            if (conversation.creator.toString() ===
                req.user.id.toString()) {
                role = "creator";
            }
            if (role !== "creator") {
                const err = {
                    name: "Không có quyền truy cập",
                    statusCode: 400,
                    message: "Chỉ có chủ phòng mới được quyền giải tán nhóm",
                };
                throw err;
            }
            // Tiến hành giải tán nhóm
            yield conversation.update({
                $set: {
                    members: [],
                    creator: null,
                    admins: [],
                },
            });
            conversation.members.map((userId) => __awaiter(this, void 0, void 0, function* () {
                yield user_model_1.default.findByIdAndUpdate(userId, {
                    $pull: { conversations: conversation.id },
                });
            }));
            // Ok
            res.json({
                status: true,
                message: "Đá người dùng khỏi phòng thành công",
                conversation,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = disGroup;
