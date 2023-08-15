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
function removeAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { conversationId } = req.params;
        const { userId } = req.body;
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
            // Nếu người dùng không phải chủ phòng (từ chối thực hiện thao tác)
            if (conversation.creator.toString() !== req.user.id.toString()) {
                const err = {
                    name: "Không có quyền",
                    statusCode: 400,
                    message: "Bạn không phải chủ phòng, không có quyền thực hiện thao tác này",
                };
                throw err;
            }
            // Tiến hành xóa admin biến người dùng thành người dùng thường
            yield conversation.update({ $pull: { admins: userId } });
            yield conversation.save();
            const _con = yield conversation.populate([
                {
                    path: "lastMessage",
                    populate: {
                        path: "attachment",
                    },
                },
                {
                    path: "lastMessage",
                    populate: {
                        path: "sender",
                        populate: {
                            path: "profile",
                        },
                    },
                },
                {
                    path: "members",
                    populate: {
                        path: "profile",
                    },
                },
                {
                    path: "conversationReadByUser",
                },
            ]);
            // Ok
            res.json({
                status: true,
                message: "Loại bỏ phó phòng thành công",
                conversation: _con,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = removeAdmin;
