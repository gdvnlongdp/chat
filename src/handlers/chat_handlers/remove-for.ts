import { Response } from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import MessageModel from "../../models/message-model";

export const removeMessageForYou = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }

    const message = await MessageModel.findByIdAndUpdate(
      req.params.messageId,
      { $addToSet: { removeFor: req.user.id } },
      { new: true }
    );

    if (!message) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 400,
        message: "Xóa ở phía tôi thất bại",
      };
      throw err;
    }

    res.json({
      status: true,
      message: "Xóa ở phía tôi thành công",
      messageId: message.id,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Xóa ở phía tôi thất bại",
    });
    console.log(err);
  }
};
