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
const message_model_1 = __importDefault(require("../../models/message-model"));
function getChatLogById(req, res, next) {
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
            // Kiểm tra người dùng có thuộc hộp thoại này hay không
            const conversation = yield conversation_model_1.default.findOne({
                _id: req.params.conversationId,
                members: req.user.id,
            });
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 404,
                    message: "Người dùng không phải có trong hộp thoại này",
                };
                throw err;
            }
            // Tiến hành lấy danh sách tin nhắn của hộp thoại
            const messageList = yield message_model_1.default.find({
                conversation: conversation.id,
            })
                .sort({ createdAt: -1 })
                .populate([
                {
                    path: "reaction",
                    populate: {
                        path: "user",
                        populate: {
                            path: "profile",
                        },
                    },
                },
                {
                    path: "sender",
                    populate: {
                        path: "profile",
                    },
                },
                {
                    path: "reply",
                    populate: [
                        {
                            path: "reaction",
                            populate: {
                                path: "user",
                                populate: {
                                    path: "profile",
                                },
                            },
                        },
                        {
                            path: "sender",
                            populate: {
                                path: "profile",
                            },
                        },
                        {
                            path: "attachment",
                        },
                    ],
                },
            ])
                .populate("attachment");
            res.json({
                status: true,
                message: "Lấy danh sách tin nhắn của hộp thoại thành công",
                messageList,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getChatLogById;
