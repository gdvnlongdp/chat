"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const streamifier_1 = __importDefault(require("streamifier"));
const couldinary_1 = __importDefault(require("../drivers/couldinary"));
// Upload file dạng Buffer lên cloud thông qua streamifier
function uploadFromBuffer(req, options) {
    return new Promise((resolve, rejects) => {
        var _a;
        const stream = couldinary_1.default.uploader.upload_stream(options, (err, result) => {
            if (err) {
                return rejects(err);
            }
            if (result) {
                return resolve(result);
            }
        });
        streamifier_1.default.createReadStream((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer).pipe(stream);
    });
}
exports.default = uploadFromBuffer;
