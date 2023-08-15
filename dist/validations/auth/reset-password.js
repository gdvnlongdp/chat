"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateResetPassword() {
    return [
        (0, express_validator_1.check)("email")
            .notEmpty()
            .withMessage("Yêu cầu email tài khoản")
            .isEmail()
            .withMessage("Email tài khoản không đúng định dạng"),
        (0, express_validator_1.check)("code")
            .notEmpty()
            .withMessage("Yêu cầu mã xác minh")
            .isNumeric()
            .withMessage("Mã xác minh không hợp lệ"),
        (0, express_validator_1.check)("password")
            .notEmpty()
            .withMessage("Yêu cầu mật khẩu")
            .isLength({ min: 6, max: 20 })
            .withMessage("Mật khẩu phải có độ dài ít nhất 6 ký tự và nhiều nhất 20 ký tự"),
    ];
}
exports.default = validateResetPassword;
