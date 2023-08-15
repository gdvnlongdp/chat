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
const user_model_1 = __importDefault(require("../../models/user-model"));
function createGroup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, memberIds } = req.body;
        try {
            // Ràng buộc đầu vào
            const errs = (0, express_validator_1.validationResult)(req);
            if (!errs.isEmpty()) {
                const err = {
                    name: "Lỗi ràng buộc đầu vào",
                    statusCode: 400,
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
            // Kiểm tra danh sách memberIds có ai không phải bạn của bạn không?
            const user = yield user_model_1.default.findById(req.user.id).populate("friends");
            if (!user) {
                const err = {
                    name: "Không tìm thấy người dùng",
                    statusCode: 401,
                    message: "Token không hợp lệ",
                };
                throw err;
            }
            // Kiểm tra member được thêm vào có phải là bạn của bạn không? Nếu không,
            // nếu không, không có quyền thêm vào
            // Tạo mới một nhóm
            const newConversation = new conversation_model_1.default({
                name,
                members: [req.user.id, ...memberIds.map((el) => el.toString())],
                type: "group",
                creator: req.user.id,
            });
            yield newConversation.save();
            newConversation.members.forEach((el) => __awaiter(this, void 0, void 0, function* () {
                yield user_model_1.default.findByIdAndUpdate(el, {
                    $addToSet: { conversations: newConversation.id },
                });
            }));
            const con = yield conversation_model_1.default.findById(newConversation.id).populate([
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
                // {
                //   path: "lastMessage",
                //   populate: [
                //     {
                //       path: "reaction",
                //       populate: {
                //         path: "user",
                //         populate: {
                //           path: "profile",
                //         },
                //       },
                //     },
                //     {
                //       path: "sender",
                //       populate: {
                //         path: "profile",
                //       },
                //     },
                //     {
                //       path: "reply",
                //       populate: [
                //         {
                //           path: "reaction",
                //           populate: {
                //             path: "user",
                //             populate: {
                //               path: "profile",
                //             },
                //           },
                //         },
                //         {
                //           path: "sender",
                //           populate: {
                //             path: "profile",
                //           },
                //         },
                //         {
                //           path: "attachment",
                //         },
                //       ],
                //     },
                //   ],
                // },
                // { path: "members", populate: "profile" },
                // {
                //   path: "conversationReadByUser",
                //   populate: {
                //     path: "userId",
                //     populate: "profile",
                //   },
                // },
            ]);
            // .populate({
            //   path: "lastMessage",
            //   populate: {
            //     path: "attachment",
            //   },
            // })
            // .populate({
            //   path: "lastMessage",
            //   populate: {
            //     path: "sender",
            //     populate: {
            //       path: "profile",
            //     },
            //   },
            // })
            // .populate({
            //   path: "members",
            //   populate: {
            //     path: "profile",
            //   },
            // })
            // .populate({
            //   path: "conversationReadByUser",
            // });
            // Ok, gửi kết quả trả về
            res.status(201).json({
                status: true,
                message: "Tạo nhóm thành công",
                conversation: Object.assign(Object.assign({}, con === null || con === void 0 ? void 0 : con.toJSON()), { unreadCount: 1, messages: [] }),
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = createGroup;
