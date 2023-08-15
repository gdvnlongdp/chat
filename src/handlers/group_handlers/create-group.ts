import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import CreateGroupDto from "../../dtos/group/create-group-dto";
import ConversationModel from "../../models/conversation-model";
import UserModel from "../../models/user-model";

async function createGroup(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { name, memberIds }: CreateGroupDto = req.body;
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
    // Kiểm tra danh sách memberIds có ai không phải bạn của bạn không?
    const user = await UserModel.findById(req.user.id).populate("friends");
    if (!user) {
      const err: HttpException = {
        name: "Không tìm thấy người dùng",
        statusCode: 401,
        message: "Token không hợp lệ",
      };
      throw err;
    }
    // Kiểm tra member được thêm vào có phải là bạn của bạn không? Nếu không,
    // nếu không, không có quyền thêm vào

    // Tạo mới một nhóm
    const newConversation = new ConversationModel({
      name,
      members: [req.user.id, ...memberIds.map((el) => el.toString())],
      type: "group",
      creator: req.user.id,
    });
    await newConversation.save();
    newConversation.members.forEach(async (el) => {
      await UserModel.findByIdAndUpdate(el, {
        $addToSet: { conversations: newConversation.id },
      });
    });
    const con = await ConversationModel.findById(newConversation.id).populate([
      {
        path: "lastMessage",
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
        ],
      },
      { path: "members", populate: "profile" },
      {
        path: "conversationReadByUser",
        populate: {
          path: "userId",
          populate: "profile",
        },
      },
      // {
      //   path: "lastMessage",
      //   populate: [
      //     {
      //       path: "reaction",
      //       populate: {
      //         path: "user",
      //         populate: {
      //           path: "profile",
      //         },
      //       },
      //     },
      //     {
      //       path: "sender",
      //       populate: {
      //         path: "profile",
      //       },
      //     },
      //     {
      //       path: "reply",
      //       populate: [
      //         {
      //           path: "reaction",
      //           populate: {
      //             path: "user",
      //             populate: {
      //               path: "profile",
      //             },
      //           },
      //         },
      //         {
      //           path: "sender",
      //           populate: {
      //             path: "profile",
      //           },
      //         },
      //         {
      //           path: "attachment",
      //         },
      //       ],
      //     },
      //   ],
      // },
      // { path: "members", populate: "profile" },
      // {
      //   path: "conversationReadByUser",
      //   populate: {
      //     path: "userId",
      //     populate: "profile",
      //   },
      // },
    ]);
    // .populate({
    //   path: "lastMessage",
    //   populate: {
    //     path: "attachment",
    //   },
    // })
    // .populate({
    //   path: "lastMessage",
    //   populate: {
    //     path: "sender",
    //     populate: {
    //       path: "profile",
    //     },
    //   },
    // })
    // .populate({
    //   path: "members",
    //   populate: {
    //     path: "profile",
    //   },
    // })
    // .populate({
    //   path: "conversationReadByUser",
    // });
    // Ok, gửi kết quả trả về
    res.status(201).json({
      status: true,
      message: "Tạo nhóm thành công",
      conversation: {
        ...con?.toJSON(),
        unreadCount: 1,
        messages: [],
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default createGroup;
