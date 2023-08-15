"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateChangePassword() {
    return [
        (0, express_validator_1.check)("password").notEmpty().withMessage("Yêu cầu mật khẩu cũ"),
        (0, express_validator_1.check)("newPassword")
            .notEmpty()
            .withMessage("Yêu cầu mật khẩu mới")
            .isLength({ min: 6, max: 20 })
            .withMessage("Mật khẩu phải có độ dài ít nhất 6 ký tự và nhiều nhất 20 ký tự")
            .custom((value, { req }) => {
            if (value === req.body.password) {
                throw new Error("Mật khẩu mới phải không trùng mật khẩu cũ");
            }
            return true;
        }),
    ];
}
exports.default = validateChangePassword;
