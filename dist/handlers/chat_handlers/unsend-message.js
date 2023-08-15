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
exports.unSendMessage = void 0;
const message_model_1 = __importDefault(require("../../models/message-model"));
const unSendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const message = yield message_model_1.default.findOneAndUpdate({
            _id: req.params.messageId,
            senderId: req.user.id,
        }, { unsend: true }, { new: true });
        if (!message) {
            const err = {
                name: "Không tìm thấy token",
                statusCode: 400,
                message: "Thu hồi tin nhắn thất bại",
            };
            throw err;
        }
        res.json({
            status: true,
            message: "Thu hồi tin nhắn thành công",
            conversationId: message.conversation,
            messageId: message.id,
        });
    }
    catch (err) {
        res.status(400).json({
            message: "Thu hồi tin nhắn thất bại",
        });
        console.log(err);
    }
});
exports.unSendMessage = unSendMessage;
