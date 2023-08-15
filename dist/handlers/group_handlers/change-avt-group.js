"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversation_model_1 = __importDefault(require("../../models/conversation-model"));
function changeAvtGroup(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { conversationId } = req.body;
        try {
            // Kiểm tra access token
            if (!req.user) {
                const err = {
                    name: "Không tìm thấy token",
                    statusCode: 403,
                    message: "Truy cập yêu cầu access token",
                };
                throw err;
            }
            // Kiểm tra file avatar
            if (!req.file) {
                const err = {
                    name: "Không tìm thấy ảnh đại diện của người dùng",
                    statusCode: 404,
                    message: "Yêu cầu tải lên ảnh đại diện",
                };
                throw err;
            }
            // Tiến hành tải ảnh đại diện vào cloudinary
            // const img = await uploadFromBuffer(req, {
            //   folder: `profile/${req.user.profileId}`,
            //   resource_type: "image",
            //   transformation: {
            //     width: 400,
            //     gravity: "auto",
            //     crop: "fill",
            //   },
            // });
            // Cập nhật đường link ảnh đại diện đã lấy được từ bước upload vào hồ sơ
            const _con = yield conversation_model_1.default.findOne({
                _id: conversationId,
                type: "group",
            });
            if (!_con) {
                const err = {
                    name: "Không tồn tại",
                    statusCode: 404,
                    message: "Không tìm thấy hộp thoại",
                };
                throw err;
            }
            if (!_con.members.includes(req.user.id)) {
                const err = {
                    name: "Không có quyền",
                    statusCode: 400,
                    message: "Người dùng không có quyền truy cập hộp thoại này",
                };
                throw err;
            }
            // Kiểm tra người dùng có phải người quyền hay không
            if (_con.creator.toString() !== req.user.id.toString() &&
                !_con.admins.includes(req.user.id)) {
                const err = {
                    name: "Không có quyền",
                    statusCode: 400,
                    message: "Chỉ có trường phòng và phó phòng mới có quyền thay đổi ảnh đại diện nhóm",
                };
                throw err;
            }
            yield _con.updateOne({
                avatar: `${req.protocol}://${req.get("host")}/static/${req.file.filename}`,
            });
            console.log("upload avt ", _con);
            // Ok, gửi kết quả trả về
            res.status(201).json({
                status: true,
                message: "Cập nhật ảnh nhóm thành công",
                conversation: yield conversation_model_1.default.findById(_con.id),
            });
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = changeAvtGroup;
