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
exports.removeConversation = void 0;
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
const message_model_1 = __importDefault(require("../../models/message-model"));
const removeConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Kiểm tra người dùng có trong hộp thoại hay không?
        const conversation = yield conversation_model_1.default.findOne({
            _id: req.params.conversationId,
            members: req.user.id,
        });
        if (!conversation) {
            const err = {
                name: "Không tìm thấy hộp thoại",
                statusCode: 400,
                message: "Người dùng không có quyền truy cập hộp thoại này",
            };
            throw err;
        }
        const messages = yield message_model_1.default.find({
            conversation: conversation.id,
        });
        messages.forEach((el) => __awaiter(void 0, void 0, void 0, function* () { var _a; return el.update({ $addToSet: { removeFor: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } }); }));
        const _con = yield conversation_model_1.default.findById(conversation.id)
            // .lean()
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
        res.json({
            status: true,
            message: "Xóa lịch sử trò chuyện tin nhắn thành công",
            conversation: _con,
        });
    }
    catch (err) {
        res.status(400).json({
            message: "Xóa lịch sử trò chuyện tin nhắn thất bại",
        });
        console.log(err);
    }
});
exports.removeConversation = removeConversation;
