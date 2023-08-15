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
function changeGroupName(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name } = req.body;
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
            //
            const _con = yield conversation_model_1.default.findOne({
                _id: req.params.groupId,
                type: "group",
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
                // .populate({
                //   path: "members",
                //   populate: {
                //     path: "profile",
                //   },
                // })
                .populate({
                path: "conversationReadByUser",
            });
            if (!_con) {
                const err = {
                    name: "Không tồn tại",
                    statusCode: 404,
                    message: "Không tìm thấy hộp thoại",
                };
                throw err;
            }
            if (!_con.members.includes(req.user.id)) {
                const err = {
                    name: "Không có quyền",
                    statusCode: 400,
                    message: "Người dùng không có quyền truy cập hộp thoại này",
                };
                throw err;
            }
            // Kiểm tra người dùng có phải người quyền hay không
            if (_con.creator.toString() !== req.user.id.toString() &&
                !_con.admins.includes(req.user.id)) {
                const err = {
                    name: "Không có quyền",
                    statusCode: 400,
                    message: "Chỉ có trường phòng và phó phòng mới có quyền thay đổi tên nhóm",
                };
                throw err;
            }
            yield _con.updateOne({ $set: { name } });
            yield _con.save();
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Đổi tên nhóm thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = changeGroupName;
