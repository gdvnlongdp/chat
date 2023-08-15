import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import SendMessageDto from "../../dtos/chat/send-message-dto";
import AttachmentModel from "../../models/attachment-model";
import ConversationModel from "../../models/conversation-model";
import ConversationReadByUserModel from "../../models/conversation-read-by-user-model";
import MessageModel from "../../models/message-model";
import NotificationModel from "../../models/notification-model";

async function sendMessage(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { content, resourceType, repId, tags, isSticker }: SendMessageDto =
    req.body;

  const detectResoureType = (mineType: string) => {
    switch (mineType) {
      case "png":
        return "image";
      case "jpg":
        return "image";
      case "mp4":
        return "video";
      case "ogg":
        return "audio";
      case "wav":
        return "audio";
      case "mp3":
        return "audio";
      default:
        return "raw";
    }
  };

  try {
    // Ràng buộc đầu vào
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      const err: HttpException = {
        name: "Lỗi ràng buộc đầu vào",
        statusCode: 403,
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

    // const _user = await UserModel.findById(req.user.id).populate("profile");

    // Kiểm tra người dùng có thuộc hộp thoại này hay không
    const conversation = await ConversationModel.findOne({
      _id: req.params.conversationId,
      members: req.user.id,
    }).populate("members");

    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 404,
        message: "Không có quyền gửi tin nhắn",
      };
      throw err;
    }

    // Kiểm tra có upload file không, nếu có tiến hành upload
    // và lưu vào hệ thống
    let newAttachment;
    if (req.file) {
      // const resource = await uploadFromBuffer(req, {
      //   use_filename: true,
      //   folder: `chat/${req.params.conversationId}`,
      //   resource_type: "auto",
      // });
      // newAttachment = new AttachmentModel({
      //   conversation: req.params.conversationId,
      //   filename: req.file.originalname,
      //   url: resource.secure_url,
      //   size: resource.bytes,
      //   resourceType:
      //     resource.format === "pdf" ? "raw" : resource.resource_type,
      // });
      // await newAttachment.save();
      newAttachment = new AttachmentModel({
        conversation: req.params.conversationId,
        filename: req.file.originalname,
        // url: `${process.env.DOMAIN}/static/${req.file.filename}`,
        url: `${req.protocol}://${req.get("host")}/static/${req.file.filename}`,
        size: req.file.size,
        resourceType:
          resourceType ?? detectResoureType(req.file.mimetype.split("/")[1]),
      });
      await newAttachment.save();
    }

    const newMessage = new MessageModel({
      conversation: req.params.conversationId,
      content,
      attachment: newAttachment ? newAttachment.id : null,
      sender: req.user.id,
      // reply: repId === '' ? null : repId,
      reply: repId || undefined,
      tags,
      isSticker,
    });
    await newMessage.save();

    await conversation.updateOne({
      lastMessage: newMessage.id,
    });

    conversation.members.forEach(async (user) => {
      if (user.id.toString() !== req.user?.id.toString()) {
        // Luu thong bao
        const newNoti = new NotificationModel({
          message: newMessage.attachment
            ? "Đã gửi một file"
            : newMessage.content
            ? newMessage.content
            : "",
          userId: user.id.toString(),
          type: "chat",
        });
        await newNoti.save();

        await ConversationReadByUserModel.findOneAndUpdate(
          {
            conversationId: conversation.id,
            userId: user.id,
          },
          { $inc: { __v: 1 } }
        );

        // Gủi thông báo đến firebase
        // const device = await DeviceModel.findOne({
        //   userId: user.id,
        // });

        // console.log(newMessage);
        // if (device) {
        //   await admin.messaging().sendMulticast({
        //     notification: {
        //       title: (_user!.profile as any).name,
        //       body: newMessage.content ? newMessage.content : "Có tin nhắn mới",
        //     },
        //     data: {
        //       title: (_user!.profile as any).name,
        //       conversationId: conversation.id,
        //       body: newMessage.content ? newMessage.content : "Có tin nhắn mới",
        //     },
        //     tokens: [device?.token],
        //   });
        // }
      }
    });

    // Đánh dấu người dùng đã đọc tin nhắn

    await conversation.updateOne({
      unread: conversation.members,
    });
    await conversation.updateOne({
      $pull: { unread: req.user.id },
    });
    await conversation.save();

    const messPopulateAttachment = await MessageModel.populate(
      newMessage,
      "attachment"
    );

    // Ok
    res.json({
      status: true,
      message: `Gửi tin nhắn thành công đến hộp thoại có id là ${req.params.conversationId}`,
      newMessage: await messPopulateAttachment.populate([
        {
          path: "sender",
          populate: {
            path: "profile",
          },
        },
        {
          path: "reply",
          populate: [
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
              populate: {
                path: "profile",
              },
            },
            {
              path: "attachment",
            },
          ],
        },
      ]),
    });
    await newMessage.save();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default sendMessage;
