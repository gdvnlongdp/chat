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
function refreshTokenHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { refreshToken } = req.body;
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
            // Kiểm tra refreshToken
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            // Tạo access token
            const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, profileId: decoded.profileId }, process.env.ACCESS_TOKEN_SECRET_KEY, {
                expiresIn: "3d", // Thời gian sống của token là 15 phút
            });
            // Tạo refresh token
            const _refreshToken = jsonwebtoken_1.default.sign({ id: decoded.id, profileId: decoded.profileId }, process.env.REFRESH_TOKEN_SECRET_KEY, {
                expiresIn: "1y", // Thời gian sống của token là 1 năm
            });
            // Ok, gửi response
            res.json({
                status: true,
                message: "Làm mới token thành công",
                accessToken,
                refreshToken: _refreshToken,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = refreshTokenHandler;
