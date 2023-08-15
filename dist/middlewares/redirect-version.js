"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function redirectVersion(payload) {
    return function (req, res, next) {
        try {
            const version = req.header("x-api-version") || "v1";
            if (!payload[version]) {
                const err = {
                    name: "Không trùng khớp",
                    statusCode: 400,
                    message: "Phiên bản api không tồn tại",
                };
                next(err);
            }
            payload[version].call(this, req, res, next);
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    };
}
exports.default = redirectVersion;
