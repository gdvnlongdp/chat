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
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
function getLastMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            // Kiểm tra người dùng có quyền truy cập không
            const conversation = yield conversation_model_1.default.findOne({
                _id: req.params.conversationId,
                members: req.user.id,
            }).populate("lastMessage");
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 403,
                    message: "Người dùng không có quyền truy cập",
                };
                throw err;
            }
            res.json({
                status: true,
                message: "Lấy tin nhắn cuối cùng của hộp thoại thành công",
                lastMesage: conversation.lastMessage,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getLastMessage;
