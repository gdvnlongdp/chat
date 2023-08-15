"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateLogin() {
    return [
        (0, express_validator_1.check)("email").notEmpty().withMessage("Yêu cầu tên tài khoản"),
        (0, express_validator_1.check)("password").notEmpty().withMessage("Yêu cầu mật khẩu"),
    ];
}
exports.default = validateLogin;
