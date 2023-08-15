import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import AttachmentModel from "../../models/attachment-model";
import ConversationModel from "../../models/conversation-model";
import FriendRequestModel from "../../models/friend-request-model";
import MessageModel from "../../models/message-model";
import UserModel from "../../models/user-model";

async function accept(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userId } = req.body;
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

    // const friendRecipient = await FriendModel.findOneAndUpdate(
    //   {
    //     requester: userId,
    //     recipient: req.user.id,
    //   },
    //   { $set: { status: 3 } }
    // );
    // const friendRequest = await FriendModel.findOneAndUpdate(
    //   {
    //     requester: req.user.id,
    //     recipient: userId,
    //   },
    //   { $set: { status: 3 } }
    // );

    const request = await FriendRequestModel.findOne({
      from: userId,
      to: req.user.id,
      status: "pending",
    });
    if (!request) {
      const err: HttpException = {
        name: "Không tìm thấy yêu cầu",
        statusCode: 404,
        message: "Cập nhật không thành công",
      };
      throw err;
    }

    const user = await UserModel.findById(req.user.id);
    await user?.updateOne({ $pull: { friendRequests: request.id } });
    await user?.updateOne({ $addToSet: { friends: userId } });
    await user?.save();

    const userFrom = await UserModel.findById(userId).populate("profile");
    await userFrom?.updateOne({ $pull: { friendRequests: request.id } });
    await userFrom?.updateOne({ $addToSet: { friends: req.user.id } });
    await userFrom?.save();

    await request.delete();

    // Kiểm tra đã từng là bạn bè chưa
    let conversation = await ConversationModel.findOne({
      type: "one-to-one",
      members: { $all: [req.user.id.toString(), userId] },
    })
      .populate({
        path: "lastMessage",
        populate: {
          path: "attachment",
        },
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          populate: {
            path: "profile",
          },
        },
      })
      .populate({
        path: "members",
        populate: {
          path: "profile",
        },
      })
      .populate({
        path: "conversationReadByUser",
      })
      .sort({ updatedAt: -1 });

    if (!conversation) {
      // Sau khi kết bạn, tạo mới cuộc trò chuyện cá nhân
      const newConversation = new ConversationModel({
        members: [req.user.id, userId],
        type: "one-to-one",
        unread: [req.user.id, userId],
      });
      await newConversation.save();

      // Cập nhật user conversation
      await UserModel.findByIdAndUpdate(req.user.id, {
        $addToSet: { conversations: newConversation.id },
      });
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: { conversations: newConversation.id },
      });
      const _conver = await ConversationModel.findById(newConversation.id)
        .populate({
          path: "lastMessage",
          populate: {
            path: "attachment",
          },
        })
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            populate: {
              path: "profile",
            },
          },
        })
        .populate({
          path: "members",
          populate: {
            path: "profile",
          },
        })
        .populate({
          path: "conversationReadByUser",
        })
        .sort({ updatedAt: -1 });

      ((_conver as any).messages = await MessageModel.find({
        conversation: _conver?.id,
        removeFor: { $nin: [req.user?.id] },
      })
        .populate([
          {
            path: "reaction",
            populate: {
              path: "user",
              populate: {
                path: "profile",
              },
            },
          },
          {
            path: "sender",
            populate: "profile",
          },
          {
            path: "attachment",
          },
        ])
        .sort({ updatedAt: -1 })),
        ((_conver as any).attachments = await AttachmentModel.find({
          conversation: _conver?.id,
        }));

      res.json({
        status: true,
        message: "Đã chấp nhận kết bạn thành công",
        friend: userFrom,
        conversation: _conver,
      });
      return;
    }

    const messages = await MessageModel.find({
      conversation: conversation?.id,
      removeFor: { $nin: [req.user?.id] },
    })
      .populate([
        {
          path: "reaction",
          populate: {
            path: "user",
            populate: {
              path: "profile",
            },
          },
        },
        {
          path: "sender",
          populate: "profile",
        },
        {
          path: "attachment",
        },
      ])
      .sort({ updatedAt: -1 });
    const attachments = await AttachmentModel.find({
      conversation: conversation?.id,
    });

    res.json({
      status: true,
      message: "Đã chấp nhận kết bạn thành công",
      friend: userFrom,
      conversation: {
        ...conversation.toJSON(),
        messages,
        attachments,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default accept;
