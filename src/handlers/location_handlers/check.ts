import express from "express";
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

async function check(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  console.log("go here");
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
    const user = await UserModel.findOne({
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
    } else {
      console.log("go here");
      const docs = await LocationModel.find({
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
      const a = docs.map((el: any) => {
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

      const x = a.filter(
        (el: any, index: number) =>
          a.findIndex((ell: any) => ell.username === el.username) === index
      );
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
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default check;
