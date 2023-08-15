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
function getGroupList(req, res, next) {
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
            // Tìm danh sách nhóm có người dùng truy cập chính thành viên trong đó
            const conversationList = yield conversation_model_1.default.find({
                members: req.user.id,
                type: "group",
            }).populate("members");
            if (!conversationList) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 404,
                    message: "Không tìm thấy nhóm",
                };
                throw err;
            }
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Lấy danh sách nhóm của người dùng thành công",
                groupList: conversationList,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getGroupList;
