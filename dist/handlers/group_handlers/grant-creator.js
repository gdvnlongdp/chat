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
function grantCreator(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            // Kiểm tra chủ phòng
            const conversation = yield conversation_model_1.default.findOne({
                _id: req.params.conversationId,
                creator: req.user.id,
                type: "group",
            });
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 400,
                    message: "Người dùng không phải chủ phòng",
                };
                throw err;
            }
            // Kiểm tra người được thêm phải thuộc trong nhóm
            if (!conversation.members.includes(userId)) {
                const err = {
                    name: "Không tìm thấy người dùng trong nhóm",
                    statusCode: 400,
                    message: "Người được thêm không phải thành viên trong nhóm",
                };
                throw err;
            }
            // Tiến hành đổi chủ phòng, nếu người được thêm đang là phó phòng,
            // thì xóa sau khi nhượng quyền, xóa danh sách phó phòng
            yield conversation.update({ $set: { creator: userId } });
            if (conversation.admins.includes(userId)) {
                yield conversation.update({ $pull: { admins: userId } });
            }
            yield conversation.save();
            const _con = yield conversation_model_1.default.findById(conversation.id)
                .populate({
                path: "creator",
                populate: {
                    path: "profile",
                },
            })
                .populate({
                path: "admins",
                populate: {
                    path: "profile",
                },
            })
                .populate({
                path: "lastMessage",
                populate: {
                    path: "attachment",
                },
            })
                .populate({
                path: "lastMessage",
                populate: {
                    path: "sender",
                    populate: {
                        path: "profile",
                    },
                },
            })
                .populate({
                path: "members",
                populate: {
                    path: "profile",
                },
            })
                .populate({
                path: "conversationReadByUser",
            })
                .sort({ updatedAt: -1 });
            // Ok
            res.json({
                status: true,
                message: "Trao quyền chủ phòng cho người dùng thành công",
                conversation: _con,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = grantCreator;
