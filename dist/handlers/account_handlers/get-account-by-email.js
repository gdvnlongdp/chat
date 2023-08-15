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
const user_model_1 = __importDefault(require("../../models/user-model"));
function getAccountByEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let user = yield user_model_1.default.findOne({
                $or: [{ email: req.query.email }, { username: req.query.email }],
            }).populate("profile");
            // Tìm kiếm bằng số điện thoại
            const users = yield user_model_1.default.find().populate("profile");
            const _user = users.find((item) => item.profile.phone === req.query.email);
            if (_user) {
                user = _user;
            }
            if (!user) {
                const err = {
                    name: "Không tìm thấy người dùng",
                    statusCode: 404,
                    message: "Không tìm thấy người dùng",
                };
                throw err;
            }
            res.json({
                status: true,
                message: "Lấy thông tin người dùng thành công",
                user,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getAccountByEmail;
