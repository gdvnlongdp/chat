"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Tạo ngẫu nhiên một mã code toàn số có định dạng XXXXXX
function randCode(head = 1e5, tail = 1e6 - 1) {
    return Math.floor(Math.random() * (tail - head + 1) + head);
}
exports.default = randCode;
