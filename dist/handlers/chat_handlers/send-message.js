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
const attachment_model_1 = __importDefault(require("../../models/attachment-model"));
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
const conversation_read_by_user_model_1 = __importDefault(require("../../models/conversation-read-by-user-model"));
const message_model_1 = __importDefault(require("../../models/message-model"));
const notification_model_1 = __importDefault(require("../../models/notification-model"));
function sendMessage(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { content, resourceType, repId, tags, isSticker } = req.body;
        const detectResoureType = (mineType) => {
            switch (mineType) {
                case "png":
                    return "image";
                case "jpg":
                    return "image";
                case "mp4":
                    return "video";
                case "ogg":
                    return "audio";
                case "wav":
                    return "audio";
                case "mp3":
                    return "audio";
                default:
                    return "raw";
            }
        };
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
            // const _user = await UserModel.findById(req.user.id).populate("profile");
            // Kiểm tra người dùng có thuộc hộp thoại này hay không
            const conversation = yield conversation_model_1.default.findOne({
                _id: req.params.conversationId,
                members: req.user.id,
            }).populate("members");
            if (!conversation) {
                const err = {
                    name: "Không tìm thấy hộp thoại",
                    statusCode: 404,
                    message: "Không có quyền gửi tin nhắn",
                };
                throw err;
            }
            // Kiểm tra có upload file không, nếu có tiến hành upload
            // và lưu vào hệ thống
            let newAttachment;
            if (req.file) {
                // const resource = await uploadFromBuffer(req, {
                //   use_filename: true,
                //   folder: `chat/${req.params.conversationId}`,
                //   resource_type: "auto",
                // });
                // newAttachment = new AttachmentModel({
                //   conversation: req.params.conversationId,
                //   filename: req.file.originalname,
                //   url: resource.secure_url,
                //   size: resource.bytes,
                //   resourceType:
                //     resource.format === "pdf" ? "raw" : resource.resource_type,
                // });
                // await newAttachment.save();
                newAttachment = new attachment_model_1.default({
                    conversation: req.params.conversationId,
                    filename: req.file.originalname,
                    // url: `${process.env.DOMAIN}/static/${req.file.filename}`,
                    url: `${req.protocol}://${req.get("host")}/static/${req.file.filename}`,
                    size: req.file.size,
                    resourceType: resourceType !== null && resourceType !== void 0 ? resourceType : detectResoureType(req.file.mimetype.split("/")[1]),
                });
                yield newAttachment.save();
            }
            const newMessage = new message_model_1.default({
                conversation: req.params.conversationId,
                content,
                attachment: newAttachment ? newAttachment.id : null,
                sender: req.user.id,
                // reply: repId === '' ? null : repId,
                reply: repId || undefined,
                tags,
                isSticker,
            });
            yield newMessage.save();
            yield conversation.updateOne({
                lastMessage: newMessage.id,
            });
            conversation.members.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (user.id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id.toString())) {
                    // Luu thong bao
                    const newNoti = new notification_model_1.default({
                        message: newMessage.attachment
                            ? "Đã gửi một file"
                            : newMessage.content
                                ? newMessage.content
                                : "",
                        userId: user.id.toString(),
                        type: "chat",
                    });
                    yield newNoti.save();
                    yield conversation_read_by_user_model_1.default.findOneAndUpdate({
                        conversationId: conversation.id,
                        userId: user.id,
                    }, { $inc: { __v: 1 } });
                    // Gủi thông báo đến firebase
                    // const device = await DeviceModel.findOne({
                    //   userId: user.id,
                    // });
                    // console.log(newMessage);
                    // if (device) {
                    //   await admin.messaging().sendMulticast({
                    //     notification: {
                    //       title: (_user!.profile as any).name,
                    //       body: newMessage.content ? newMessage.content : "Có tin nhắn mới",
                    //     },
                    //     data: {
                    //       title: (_user!.profile as any).name,
                    //       conversationId: conversation.id,
                    //       body: newMessage.content ? newMessage.content : "Có tin nhắn mới",
                    //     },
                    //     tokens: [device?.token],
                    //   });
                    // }
                }
            }));
            // Đánh dấu người dùng đã đọc tin nhắn
            yield conversation.updateOne({
                unread: conversation.members,
            });
            yield conversation.updateOne({
                $pull: { unread: req.user.id },
            });
            yield conversation.save();
            const messPopulateAttachment = yield message_model_1.default.populate(newMessage, "attachment");
            // Ok
            res.json({
                status: true,
                message: `Gửi tin nhắn thành công đến hộp thoại có id là ${req.params.conversationId}`,
                newMessage: yield messPopulateAttachment.populate([
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
                ]),
            });
            yield newMessage.save();
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = sendMessage;
