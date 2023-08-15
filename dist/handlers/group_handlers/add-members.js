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
function addMember(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userIds } = req.body;
        try {
            console.log(userIds);
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
            // Thêm thành viên vào nhóm
            const conversation = yield conversation_model_1.default.findOneAndUpdate({
                _id: req.params.id,
                members: req.user.id,
                type: "group",
            }, { $addToSet: { members: userIds.map((el) => el.toString()) } }, { new: true });
            // Thêm conversation vào user
            userIds.forEach((el) => __awaiter(this, void 0, void 0, function* () {
                yield user_model_1.default.findByIdAndUpdate(el, {
                    $addToSet: { conversations: conversation === null || conversation === void 0 ? void 0 : conversation.id },
                });
            }));
            // const group = await GroupModel.findOneAndUpdate(
            //   {
            //     _id: req.params.groupId,
            //     members: req.user.id,
            //   },
            //   {
            //     $push: { members: userIds },
            //   },
            //   { new: true }
            // );
            if (!conversation) {
                const err = {
                    name: "Nhóm không tồn tại",
                    statusCode: 404,
                    message: "Nhóm không tồn tại",
                };
                throw err;
            }
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Thêm người dùng vào nhóm thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = addMember;
