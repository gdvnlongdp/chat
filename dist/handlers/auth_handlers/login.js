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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const device_info_model_1 = __importDefault(require("../../models/device-info-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function login(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password, imei, ip, mac, token, device: _device, } = req.body;
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
            // Kiểm tra tài khoản
            const user = yield user_model_1.default.findOne({
                $or: [{ username: email }, { email }, { phone: email }],
            }).populate("profile");
            if (!user) {
                const err = {
                    name: "Tài khoản không tồn tại",
                    statusCode: 403,
                    message: "Đăng nhập thất bại. Tài khoản hoặc mật khẩu không đúng",
                };
                throw err;
            }
            // So sánh mật khẩu
            const isMatch = yield user.comparePassword(password);
            if (!isMatch) {
                const err = {
                    name: "Sai mật khẩu",
                    statusCode: 403,
                    message: "Đăng nhập thất bại. Email hoặc mật khẩu không đúng",
                };
                throw err;
            }
            // // Kiểm tra tài khoản đã được sử dụng trên thiết bị khác hay chưa
            // const dev = await DeviceInfoModel.findOne({ userId: user.id });
            // if (dev && dev.imei !== imei) {
            //   const err: HttpException = {
            //     name: "Device user đã tồn tại",
            //     statusCode: 403,
            //     message:
            //       "Không thể đăng nhập, tài khoản đã được sử dụng trên thiết bị khác",
            //   };
            //   throw err;
            // }
            // if (!dev) {
            //   // Đăng ký thiết bị trên user
            //   const newDevice = new DeviceInfoModel({
            //     userId: user.id,
            //     imei,
            //     ip,
            //     mac,
            //   });
            //   await newDevice.save();
            // }
            const device = yield device_info_model_1.default.findOneAndUpdate({
                userId: user.id,
            }, {
                imei,
                ip,
                mac,
                token,
                device: _device,
            }, { upsert: true, new: true });
            const payload = {
                id: user.id,
                profileId: user.profile._id,
            };
            // Tạo access token
            const accessToken = jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
                expiresIn: "3d", // Thời gian sống của token là 15 phút
            });
            // Tạo refresh token
            const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
                expiresIn: "1y", // Thời gian sống của token là 1 năm
            });
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Đăng nhập thành công",
                accessToken,
                refreshToken,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = login;
