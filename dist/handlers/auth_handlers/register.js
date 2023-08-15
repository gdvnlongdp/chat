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
const profile_model_1 = __importDefault(require("../../models/profile-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function register(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, email, password, name, dob, gender, phone, } = req.body;
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
            // Kiểm tra email đã được sử dụng hay chưa
            const user = yield user_model_1.default.findOne({
                $or: [{ username }, { email }, { phone }],
            });
            if (user) {
                const err = {
                    name: "Tài khoản đã tồn tại",
                    statusCode: 409,
                    message: "Tài khoản đã được sử dụng",
                };
                throw err;
            }
            // Kiểm tra mã xác minh
            // const otp = await redisClient.get(`register_${email}`);
            // if (code !== otp) {
            //   const err: HttpException = {
            //     name: "Sai mã xác minh",
            //     statusCode: 400,
            //     message: "Mã xác minh không hợp lệ",
            //   };
            //   throw err;
            // }
            // Khi đã xác minh email ok, tiến hành đăng ký tài khoản
            const newProfile = new profile_model_1.default({
                name,
                dob,
                gender,
                phone,
            });
            const newUser = new user_model_1.default({
                username,
                email,
                phone,
                password,
                profile: newProfile.id,
            });
            yield newProfile.save();
            yield newUser.save();
            // Ok, gửi kết quả trả về
            res.status(201).json({
                status: true,
                message: "Đăng ký tài khoản thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = register;
