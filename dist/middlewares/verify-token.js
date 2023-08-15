"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(req, _res, next) {
    var _a;
    try {
        // Lấy Bearer Token từ header
        const token = (_a = req.header("authorization")) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1];
        if (!token) {
            const err = {
                name: "Xác minh token thất bại",
                statusCode: 403,
                message: "Hệ thống không tìm thấy token",
            };
            throw err;
        }
        // Giải mã token và truyền thông tin đã giải mã middlware kế tiếp
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.log(err);
        if (err.name === "TokenExpiredError") {
            const _err = {
                name: "Token hết hạn",
                statusCode: 401,
                message: "Token hết hạn",
            };
            next(_err);
        }
        else {
            next(err);
        }
    }
}
exports.default = verifyToken;
