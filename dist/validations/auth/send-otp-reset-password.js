"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateSendOtpResetPassword() {
    return [
        (0, express_validator_1.check)("email")
            .notEmpty()
            .withMessage("Yêu cầu email tài khoản")
            .isEmail()
            .withMessage("Email tài khoản không đúng định dạng"),
    ];
}
exports.default = validateSendOtpResetPassword;
