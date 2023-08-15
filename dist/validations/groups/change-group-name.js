"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
function validateChangeGroupName() {
    return [
        (0, express_validator_1.check)("name")
            .notEmpty()
            .withMessage("Yêu cầu tên nhóm")
            .isLength({ min: 5 })
            .withMessage("Tên nhóm phải chứa ít nhất 5 ký tự")
            .custom((value) => {
            if (value && value[0] !== value[0].toUpperCase()) {
                throw new Error("Phải bắt đầu bằng ký tự viết hoa");
            }
            return true;
        }),
    ];
}
exports.default = validateChangeGroupName;
