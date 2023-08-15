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
const device_info_model_1 = __importDefault(require("../../models/device-info-model"));
const message_model_1 = __importDefault(require("../../models/message-model"));
const sticker_model_1 = __importDefault(require("../../models/sticker-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function getCredentials(req, res, next) {
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
            // Lấy thông tin account từ token
            const user = yield user_model_1.default.findById(req.user.id).populate([
                {
                    path: "profile",
                },
                {
                    path: "conversations",
                    populate: [
                        {
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
                        },
                        { path: "members", populate: "profile" },
                        {
                            path: "conversationReadByUser",
                            populate: {
                                path: "userId",
                                populate: "profile",
                            },
                        },
                    ],
                    options: {
                        sort: {
                            "lastMessage.createdAt": -1,
                            updatedAt: -1,
                        },
                    },
                },
                {
                    path: "friendRequests",
                    populate: [
                        { path: "from", populate: "profile" },
                        { path: "to", populate: "profile" },
                    ],
                },
                {
                    path: "friends",
                    populate: {
                        path: "profile",
                    },
                },
            ]);
            // .populate("profile")
            // .populate({
            //   path: "conversations",
            //   populate: [
            //     {
            //       path: "lastMessage",
            //       populate: [
            //         {
            //           path: "attachment",
            //         },
            //         {
            //           path: "sender",
            //           populate: {
            //             path: "profile",
            //           },
            //         },
            //       ],
            //     },
            //     {
            //       path: "members",
            //       populate: {
            //         path: "profile",
            //       },
            //     },
            //     {
            //       path: "conversationReadByUser",
            //     },
            //   ],
            // })
            // .select("-password")
            // .populate({
            //   path: "friends",
            //   populate: {
            //     path: "profile",
            //   },
            // })
            // .populate({
            //   path: "friendRequests",
            //   populate: {
            //     path: "to",
            //     populate: {
            //       path: "profile",
            //     },
            //   },
            // })
            // .populate({
            //   path: "friendRequests",
            //   populate: {
            //     path: "from",
            //     populate: {
            //       path: "profile",
            //     },
            //   },
            // });
            if (!user) {
                const err = {
                    name: "Không tìm thấy người dùng",
                    statusCode: 404,
                    message: "Access token không hợp lệ",
                };
                throw err;
            }
            let _user = Object.assign({}, user.toJSON(), {
                requests: user.friendRequests,
            });
            delete _user.friendRequests;
            _user.conversations = yield Promise.all(_user.conversations.map((el) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const val = yield el.conversationReadByUser.find((item) => {
                    var _a;
                    return (item.userId.id.toString() ===
                        ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id.toString()));
                });
                return Object.assign(Object.assign({}, el), { unreadCount: val ? val["__v"] : 1, messages: yield message_model_1.default.find({
                        conversation: el.id,
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
                        .sort({ createdAt: -1 }), attachments: yield attachment_model_1.default.find({
                        conversation: el.id,
                    }) });
            })));
            _user.conversations.sort((a, b) => {
                var _a, _b;
                // if (!a.lastMessage && !b.lastMessage) {
                //   return b.updatedAt - a.updatedAt;
                // }
                return (((_a = b.lastMessage) === null || _a === void 0 ? void 0 : _a.createdAt) - ((_b = a.lastMessage) === null || _b === void 0 ? void 0 : _b.createdAt));
            });
            // console.log(_user.conversations);
            // Lấy thông tin thiết bị
            const device = yield device_info_model_1.default.findOne({
                userId: req.user.id,
            });
            //
            const stickers = yield sticker_model_1.default.find({});
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Lấy thông tin người dùng thành công",
                device,
                user: Object.assign(Object.assign({}, _user), { stickers }),
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getCredentials;
