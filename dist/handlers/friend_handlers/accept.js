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
const attachment_model_1 = __importDefault(require("../../models/attachment-model"));
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
const friend_request_model_1 = __importDefault(require("../../models/friend-request-model"));
const message_model_1 = __importDefault(require("../../models/message-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function accept(req, res, next) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.body;
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
            // const friendRecipient = await FriendModel.findOneAndUpdate(
            //   {
            //     requester: userId,
            //     recipient: req.user.id,
            //   },
            //   { $set: { status: 3 } }
            // );
            // const friendRequest = await FriendModel.findOneAndUpdate(
            //   {
            //     requester: req.user.id,
            //     recipient: userId,
            //   },
            //   { $set: { status: 3 } }
            // );
            const request = yield friend_request_model_1.default.findOne({
                from: userId,
                to: req.user.id,
                status: "pending",
            });
            if (!request) {
                const err = {
                    name: "Không tìm thấy yêu cầu",
                    statusCode: 404,
                    message: "Cập nhật không thành công",
                };
                throw err;
            }
            const user = yield user_model_1.default.findById(req.user.id);
            yield (user === null || user === void 0 ? void 0 : user.updateOne({ $pull: { friendRequests: request.id } }));
            yield (user === null || user === void 0 ? void 0 : user.updateOne({ $addToSet: { friends: userId } }));
            yield (user === null || user === void 0 ? void 0 : user.save());
            const userFrom = yield user_model_1.default.findById(userId).populate("profile");
            yield (userFrom === null || userFrom === void 0 ? void 0 : userFrom.updateOne({ $pull: { friendRequests: request.id } }));
            yield (userFrom === null || userFrom === void 0 ? void 0 : userFrom.updateOne({ $addToSet: { friends: req.user.id } }));
            yield (userFrom === null || userFrom === void 0 ? void 0 : userFrom.save());
            yield request.delete();
            // Kiểm tra đã từng là bạn bè chưa
            let conversation = yield conversation_model_1.default.findOne({
                type: "one-to-one",
                members: { $all: [req.user.id.toString(), userId] },
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
            if (!conversation) {
                // Sau khi kết bạn, tạo mới cuộc trò chuyện cá nhân
                const newConversation = new conversation_model_1.default({
                    members: [req.user.id, userId],
                    type: "one-to-one",
                    unread: [req.user.id, userId],
                });
                yield newConversation.save();
                // Cập nhật user conversation
                yield user_model_1.default.findByIdAndUpdate(req.user.id, {
                    $addToSet: { conversations: newConversation.id },
                });
                yield user_model_1.default.findByIdAndUpdate(userId, {
                    $addToSet: { conversations: newConversation.id },
                });
                const _conver = yield conversation_model_1.default.findById(newConversation.id)
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
                (_conver.messages = yield message_model_1.default.find({
                    conversation: _conver === null || _conver === void 0 ? void 0 : _conver.id,
                    removeFor: { $nin: [(_a = req.user) === null || _a === void 0 ? void 0 : _a.id] },
                })
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
                        populate: "profile",
                    },
                    {
                        path: "attachment",
                    },
                ])
                    .sort({ updatedAt: -1 })),
                    (_conver.attachments = yield attachment_model_1.default.find({
                        conversation: _conver === null || _conver === void 0 ? void 0 : _conver.id,
                    }));
                res.json({
                    status: true,
                    message: "Đã chấp nhận kết bạn thành công",
                    friend: userFrom,
                    conversation: _conver,
                });
                return;
            }
            const messages = yield message_model_1.default.find({
                conversation: conversation === null || conversation === void 0 ? void 0 : conversation.id,
                removeFor: { $nin: [(_b = req.user) === null || _b === void 0 ? void 0 : _b.id] },
            })
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
                    populate: "profile",
                },
                {
                    path: "attachment",
                },
            ])
                .sort({ updatedAt: -1 });
            const attachments = yield attachment_model_1.default.find({
                conversation: conversation === null || conversation === void 0 ? void 0 : conversation.id,
            });
            res.json({
                status: true,
                message: "Đã chấp nhận kết bạn thành công",
                friend: userFrom,
                conversation: Object.assign(Object.assign({}, conversation.toJSON()), { messages,
                    attachments }),
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = accept;
