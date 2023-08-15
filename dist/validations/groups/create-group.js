"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateCreateGroup() {
    return [
        (0, express_validator_1.check)("name").notEmpty().withMessage("Yêu cầu tên nhóm"),
        (0, express_validator_1.check)("memberIds")
            .notEmpty()
            .withMessage("Yêu cầu danh sách id của người dùng để tạo nhóm"),
    ];
}
exports.default = validateCreateGroup;
