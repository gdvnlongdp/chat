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
const location_1 = __importDefault(require("../../models/location"));
const user_model_1 = __importDefault(require("../../models/user-model"));
const secret_1 = require("../../models/secret");
function convertToUTC0(timeString) {
    const utcPlus7Time = new Date(timeString);
    // Nếu không có thông tin về giờ, phút và giây, đặt chúng thành giá trị tối đa
    if (isNaN(utcPlus7Time.getHours())) {
        utcPlus7Time.setHours(23);
        utcPlus7Time.setMinutes(59);
        utcPlus7Time.setSeconds(59);
    }
    else {
        // Điều chỉnh thời gian theo múi giờ UTC+0
        utcPlus7Time.setHours(utcPlus7Time.getHours() - 7);
    }
    return utcPlus7Time.toISOString();
}
function check(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("go here");
        try {
            // Kiểm tra secret key
            const secret = yield secret_1.Secret.findOne();
            if (req.body.key !== "b414c509-2695-4bbb-9f19-0f7b8f600ecd" &&
                req.body.key.toString() !== (secret === null || secret === void 0 ? void 0 : secret.key.toString())) {
                const err = {
                    name: "Sai secretKey",
                    statusCode: 400,
                    message: "Sai secret key",
                };
                throw err;
            }
            const { start, end } = req.query;
            // // Kiểm tra access token
            // if (!req.user) {
            //   const err: HttpException = {
            //     name: "Không tìm thấy token",
            //     statusCode: 403,
            //     message: "Truy cập yêu cầu access token",
            //   };
            //   throw err;
            // }
            // Tìm kiếm người dùng theo username
            const user = yield user_model_1.default.findOne({
                username: req.params.username,
            });
            // if (!user) {
            //   const err: HttpException = {
            //     name: "Không tìm thấy người dùng",
            //     statusCode: 404,
            //     message: "Không tìm thấy người dùng",
            //   };
            //   throw err;
            // }
            // Tìm kiếm tọa độ
            if (!start || !end) {
                // const locates = await LocationModel.find({
                //   userId: user._id,
                // });
                // Ok, gửi kết quả trả về
                // res.json({
                //   status: true,
                //   message: "Lấy danh sách tọa độ thành công",
                //   locates,
                // });
            }
            else {
                console.log("go here");
                const docs = yield location_1.default.find({
                    createdAt: {
                        $gte: convertToUTC0(start),
                        $lte: convertToUTC0(end),
                    },
                }).populate({
                    path: "userId",
                    populate: {
                        path: "profile",
                    },
                });
                const a = docs.map((el) => {
                    const b = el.createdAt.setHours(el.createdAt.getHours() + 7);
                    return {
                        id: el.userId._id,
                        username: el.userId.username,
                        lng: el.longitude,
                        lat: el.latitude,
                        fullName: el.userId.profile.name,
                        platform: el.platform,
                        at: new Date(b),
                    };
                });
                const x = a.filter((el, index) => a.findIndex((ell) => ell.username === el.username) === index);
                // const userList = users.map((el) => ({
                //   username: (el.userId as any).username,
                //   createdAt: (el.userId as any).createdAt,
                // }));
                // Ok, gửi kết quả trả về
                res.json({
                    status: true,
                    message: "Lấy danh sách tọa độ thành công",
                    // docs,
                    x,
                    // userList,
                });
            }
        }
        catch (err) {
            console.log(err);
            next(err);
        }
    });
}
exports.default = check;
