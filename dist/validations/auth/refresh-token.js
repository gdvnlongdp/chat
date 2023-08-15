"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateRefreshToken() {
    return [(0, express_validator_1.check)("refreshToken").notEmpty().withMessage("Yêu cầu refreshToken")];
}
exports.default = validateRefreshToken;
