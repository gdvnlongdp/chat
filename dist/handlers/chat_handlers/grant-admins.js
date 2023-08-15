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
function grantAdmins(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { adminIds } = req.body;
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
            // Admins chỉ được thêm tối đa 3 phó phòng
            if (conversation.admins.length + adminIds > 3) {
                const err = {
                    name: "Phó phòng quá nhiều",
                    statusCode: 400,
                    message: "Phòng chỉ được thêm tối đa 3 phó phòng",
                };
                throw err;
            }
            // Thêm quyền phó phòng cho những người này
            // Trước tiên, kiểm trả tất cả người này có trong group hay không
            adminIds.forEach((el) => {
                if (!conversation.members.includes(el)) {
                    const err = {
                        name: "Không có quyền truy cập",
                        statusCode: 403,
                        message: "Bạn đã thêm người không phải thành viên trong nhóm làm phó phòng",
                    };
                    throw err;
                }
            });
            // Tiếp theo, thêm nhưng người này làm phó phòng
            yield conversation.update({ $addToSet: { admins: adminIds } });
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
                message: "Thêm phó phòng thành công cho nhóm",
                conversation: _con,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = grantAdmins;
