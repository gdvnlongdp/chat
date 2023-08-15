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
const friend_request_model_1 = __importDefault(require("../../models/friend-request-model"));
const user_model_1 = __importDefault(require("../../models/user-model"));
function cancelRequest(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { requestId, userId } = req.body;
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
            const request = yield friend_request_model_1.default.findByIdAndDelete(requestId);
            if (!request) {
                // Kiêm tra list friend coi đã là bạn bè chưa
                const user = yield user_model_1.default.findById(userId);
                if (user === null || user === void 0 ? void 0 : user.friends.includes(req.user.id)) {
                    res.status(404).json({
                        status: false,
                        message: "Không tìm thấy yêu cầu",
                        isFriend: true,
                    });
                    return;
                }
                const err = {
                    name: "Không tìm thấy yêu cầu",
                    statusCode: 404,
                    message: "Không tìm thấy yêu cầu",
                };
                throw err;
            }
            const user = yield user_model_1.default.findById(request.from);
            yield (user === null || user === void 0 ? void 0 : user.updateOne({
                $pull: { friendRequests: request.id },
            }));
            yield (user === null || user === void 0 ? void 0 : user.save());
            const userTo = yield user_model_1.default.findById(request.to);
            yield (userTo === null || userTo === void 0 ? void 0 : userTo.updateOne({
                $pull: { friendRequests: request.id },
            }));
            yield (userTo === null || userTo === void 0 ? void 0 : userTo.save());
            res.json({
                status: true,
                message: "Hủy lệnh kết bạn thành công",
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = cancelRequest;
