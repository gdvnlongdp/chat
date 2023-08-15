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
function kickUser(req, res, next) {
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
            // Kiểm tra người dùng này là ai, (chủ phòng, phó phòng hay user thường)
            let role = "";
            if (conversation.creator.toString() === req.user.id.toString()) {
                role = "creator";
            }
            if (conversation.admins.includes(req.user.id)) {
                role = "admin";
            }
            console.log("test ", role, req.user.id, conversation.creator);
            if (role !== "creator" && role !== "admin") {
                const err = {
                    name: "Không có quyền truy cập",
                    statusCode: 400,
                    message: "Chỉ có chủ phòng và phó phòng được quyền kick user",
                };
                throw err;
            }
            // Nếu là phó phòng, kiểm tra người dùng bạn muốn kick phải người dùng thường hay không
            // (không phải chủ phòng và phó phòng)
            if (role === "admin") {
                // Check userId
                if (conversation.creator.toString() === userId.toString() ||
                    conversation.admins.includes(userId)) {
                    const err = {
                        name: "Không cho phép kick",
                        statusCode: 400,
                        message: "Bạn không có quyền kick người này, người này là chủ phòng",
                    };
                    throw err;
                }
            }
            // Tiến hành kick người dùng
            yield conversation.update({ $pull: { members: userId, admins: userId } });
            yield conversation.save();
            yield user_model_1.default.findByIdAndUpdate(userId, {
                $pull: { conversations: conversation.id },
            });
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
                message: "Đá người dùng khỏi phòng thành công",
                conversation: _con,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = kickUser;
