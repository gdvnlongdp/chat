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
const location_1 = __importDefault(require("../../models/location"));
function createLocate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { longitude, latitude, ip, mac, token, device, checked, platform } = req.body;
        // console.log(
        //   "debug:",
        //   req.ip,
        //   req.socket.remoteAddress,
        //   req.headers["x-forwarded-for"]
        // );
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
            // Tiến hành lưu tọa độ
            const newLocate = new location_1.default({
                userId: req.user.id,
                longitude,
                latitude,
                ip,
                mac,
                platform,
                token,
                checked,
                device,
            });
            newLocate.save();
            // Ok, gửi kết quả trả về
            res.json({
                status: true,
                message: "Ghi tọa độ thành công",
                locate: newLocate,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = createLocate;
