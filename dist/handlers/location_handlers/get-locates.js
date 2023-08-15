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
function getLocates(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const { start, end } = req.query;
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            // Tìm kiếm tọa độ
            if (!start || !end) {
                const locates = yield location_1.default.find({
                    userId: req.params.userId,
                });
                // Ok, gửi kết quả trả về
                res.json({
                    status: true,
                    message: "Lấy danh sách tọa độ thành công",
                    locates,
                });
            }
            else {
                const locates = yield location_1.default.find({
                    userId: req.params.userId,
                    createdAt: {
                        $gte: new Date(start),
                        $lte: new Date(end),
                    },
                });
                // Ok, gửi kết quả trả về
                res.json({
                    status: true,
                    message: "Lấy danh sách tọa độ thành công",
                    locates,
                });
            }
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getLocates;
