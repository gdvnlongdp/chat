import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import LocationModel from "../../models/location";
import UserModel from "../../models/user-model";
import { Secret } from "../../models/secret";

function convertToUTC0(timeString: string) {
  const utcPlus7Time = new Date(timeString);

  // Nếu không có thông tin về giờ, phút và giây, đặt chúng thành giá trị tối đa
  if (isNaN(utcPlus7Time.getHours())) {
    utcPlus7Time.setHours(23);
    utcPlus7Time.setMinutes(59);
    utcPlus7Time.setSeconds(59);
  } else {
    // Điều chỉnh thời gian theo múi giờ UTC+0
    utcPlus7Time.setHours(utcPlus7Time.getHours() - 7);
  }

  return utcPlus7Time.toISOString();
}

async function getLocatesByGroup(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    // Kiểm tra secret key
    const secret = await Secret.findOne();
    if (
      req.body.key !== "b414c509-2695-4bbb-9f19-0f7b8f600ecd" &&
      req.body.key.toString() !== secret?.key.toString()
    ) {
      const err: HttpException = {
        name: "Sai secretKey",
        statusCode: 400,
        message: "Sai secret key",
      };
      throw err;
    }

    const records = await UserModel.find({
      group: req.params.groupId,
    }).populate({
      path: "profile",
    });
    const users = records.map((el: any) => ({
      id: el._id,
      username: el.username,
      fullName: el.profile.name,
    }));

    const { start, end } = req.query;

    // // Tìm kiếm người dùng theo username
    // const user = await UserModel.findOne({
    //   username: req.params.username,
    // });
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
      const locates = await LocationModel.find({
        userId: {
          $in: users.map((el: any) => el.id),
        },
      }).populate({
        path: "userId",
        populate: {
          path: "profile",
        },
      });

      const userLocates = users.map((el: any) => {
        const _locates = locates.filter((l) => el.userId._id === el.id);

        return {
          ...el,
          locates: _locates.map((el: any) => ({
            username: el.userId.username,
            fullName: el.userId.profile.name,
            isChecked: el.checked,
            latitude: el.latitude,
            longitude: el.longitude,
            platform: el.platform,
            ip: el.ip,
            createdAt: new Date(
              el.createdAt.setHours(el.createdAt.getHours() + 7)
            ),
          })),
        };
      });

      // Ok, gửi kết quả trả về
      res.json({
        status: true,
        message: "Lấy danh sách tọa độ thành công",
        user: userLocates,
      });
    } else {
      const locates = await LocationModel.find({
        userId: {
          $in: users.map((el: any) => el.id),
        },
        createdAt: {
          $gte: convertToUTC0(start as string),
          $lte: convertToUTC0(end as string),
        },
      }).populate({
        path: "userId",
        populate: {
          path: "profile",
        },
      });

      const userLocates = users.map((el: any) => {
        const _locates = locates.filter(
          (l) => l.userId._id.toString() === el.id.toString()
        );

        return {
          ...el,
          locates: _locates.map((el: any) => ({
            username: el.userId.username,
            fullName: el.userId.profile.name,
            isChecked: el.checked,
            latitude: el.latitude,
            longitude: el.longitude,
            platform: el.platform,
            ip: el.ip,
            createdAt: new Date(
              el.createdAt.setHours(el.createdAt.getHours() + 7)
            ),
          })),
        };
      });

      // Ok, gửi kết quả trả về
      res.json({
        status: true,
        message: "Lấy danh sách tọa độ thành công",
        user: userLocates,
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getLocatesByGroup;
