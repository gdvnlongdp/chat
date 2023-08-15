import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function changeAvtGroup(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { conversationId } = req.body;
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
    // Kiểm tra file avatar
    if (!req.file) {
      const err: HttpException = {
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
    const _con = await ConversationModel.findOne({
      _id: conversationId,
      type: "group",
    });
    if (!_con) {
      const err: HttpException = {
        name: "Không tồn tại",
        statusCode: 404,
        message: "Không tìm thấy hộp thoại",
      };
      throw err;
    }
    if (!_con.members.includes(req.user.id)) {
      const err: HttpException = {
        name: "Không có quyền",
        statusCode: 400,
        message: "Người dùng không có quyền truy cập hộp thoại này",
      };
      throw err;
    }

    // Kiểm tra người dùng có phải người quyền hay không
    if (
      _con.creator.toString() !== req.user.id.toString() &&
      !_con.admins.includes(req.user.id)
    ) {
      const err: HttpException = {
        name: "Không có quyền",
        statusCode: 400,
        message:
          "Chỉ có trường phòng và phó phòng mới có quyền thay đổi ảnh đại diện nhóm",
      };
      throw err;
    }

    await _con.updateOne({
      avatar: `${req.protocol}://${req.get("host")}/static/${
        req.file.filename
      }`,
    });
    console.log("upload avt ", _con);

    // Ok, gửi kết quả trả về
    res.status(201).json({
      status: true,
      message: "Cập nhật ảnh nhóm thành công",
      conversation: await ConversationModel.findById(_con.id),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default changeAvtGroup;
