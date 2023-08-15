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
const notification_model_1 = __importDefault(require("../../models/notification-model"));
function getUnreadNoti(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const notis = yield notification_model_1.default.find({
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                read: false,
            });
            res.json({
                status: true,
                message: "Lấy danh sách thông báo chưa đọc của người dùng thành công",
                notifications: notis,
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = getUnreadNoti;
