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
const device_model_1 = __importDefault(require("../../models/device-model"));
function regisDevice(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = req.body;
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
            const device = yield device_model_1.default.findOneAndUpdate({ userId: req.user.id }, { token }, { upsert: true });
            if (!device) {
                const err = {
                    name: "Không tìm thấy thiết bị",
                    statusCode: 400,
                    message: "Đăng ký token cho thiết bị không thành công",
                };
                throw err;
            }
            res.json({
                status: true,
                message: "Đăng ký token thiết bị thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = regisDevice;
