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
function getConversationList(req, res, next) {
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
            // Lấy danh sách hộp thoại mà người dùng là thành viên trong đó
            const conversationList = yield conversation_model_1.default.find({
                members: req.user.id,
            })
                // .lean()
                .populate({
                path: "lastMessage",
                populate: {
                    path: "attachment",
                },
            })
                .populate({
                path: "lastMessage",
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
                ],
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
            const result = conversationList.map((el) => {
                const val = el.conversationReadByUser.find((item) => { var _a; return item.userId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id.toString()); });
                return Object.assign(Object.assign({}, el.toJSON()), { unreadCount: val ? val["__v"] : 1 });
            });
            // OK
            res.json({
                status: true,
                message: "Lấy danh sách hộp thoại thành công",
                conversationList: result,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getConversationList;
