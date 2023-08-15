"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateAddMember() {
    return [
        (0, express_validator_1.check)("userId")
            .notEmpty()
            .withMessage("Yêu cầu id của người dùng để thêm vào nhóm"),
    ];
}
exports.default = validateAddMember;
