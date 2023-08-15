import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import AddFriendDto from "../../dtos/relation/add-friend-dto";
import ConversationModel from "../../models/conversation-model";
import RelationshipModel from "../../models/relationship-model";

async function addFriend(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userId }: AddFriendDto = req.body;
  try {
    // Ràng buộc đầu vào
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      const err: HttpException = {
        name: "Lỗi ràng buộc đầu vào",
        statusCode: 400,
        message: errs.array()[0].msg,
      };
      throw err;
    }
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }
    // Kiểm tra mối quan hệ bạn bè đã có hay chưa
    const relationship = await RelationshipModel.findOne({
      $or: [
        { relatingUser: req.user.id, relatedUser: userId },
        { relatingUser: userId, relatedUser: req.user.id },
      ],
    });
    if (relationship) {
      if (!relationship.blockedBy) {
        const err: HttpException = {
          name: "Đã tồn tại mối quan hệ",
          statusCode: 400,
          message: "Đã là bạn bè, không thể kết bạn",
        };
        throw err;
      }
      // Nếu người truy cập đang chặn người dùng, bỏ block
      if (relationship.blockedBy === req.user.id) {
        await relationship.update({ blockedBy: null });
        await relationship.save();
      }
    } else {
      // Tiến hành kết bạn và lưu thông tin vào hệ thống
      const newRelationship = new RelationshipModel({
        relatingUser: req.user.id,
        relatedUser: userId,
      });
      await newRelationship.save();
      // Sau khi kết bạn, tạo mới cuộc trò chuyện cá nhân
      const newConversation = new ConversationModel({
        members: [req.user.id, userId],
        type: "one-to-one",
        unread: [req.user.id, userId],
      });
      await newConversation.save();
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: `Kết bạn thành công với người dùng có id là ${userId}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default addFriend;
