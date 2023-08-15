"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateActiveAccount() {
    return [
        (0, express_validator_1.check)("email")
            .notEmpty()
            .withMessage("Yêu cầu email tài khoản")
            .isEmail()
            .withMessage("Email tài khoản không đúng định dạng"),
        (0, express_validator_1.check)("code")
            .notEmpty()
            .withMessage("Yêu cầu mã kích hoạt")
            .isNumeric()
            .withMessage("Mã kích hoạt không hợp lệ"),
    ];
}
exports.default = validateActiveAccount;
