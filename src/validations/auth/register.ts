import { check } from "express-validator";

function validateRegister() {
  return [
    check("email")
      .notEmpty()
      .withMessage("Yêu cầu email tài khoản")
      .isEmail()
      .withMessage("Email tài khoản không đúng định dạng"),
    check("password")
      .notEmpty()
      .withMessage("Yêu cầu mật khẩu")
      .isLength({ min: 6, max: 20 })
      .withMessage(
        "Mật khẩu phải có độ dài ít nhất 6 ký tự và nhiều nhất 20 ký tự"
      ),
    check("name")
      .notEmpty()
      .withMessage("Yêu cầu tên người dùng")
      .isAlpha("vi-VN", { ignore: " " })
      .withMessage(
        "Tên người dùng không hợp lệ, chỉ bao gồm chữ cái và khoảng trắng"
      ),
    check("dob")
      .notEmpty()
      .withMessage("Yêu cầu ngày sinh")
      .isAfter("1900-01-01")
      .withMessage(
        "Ngày sinh phải từ thời điểm 1900-01-01 trở về sau"
      )
      .isBefore(
        new Date(Date.now() - 378683424000).toString()
      ) // Trước ngày hiện tại trừ đi 12 năm
      .withMessage(
        "Ngày sinh không hợp lệ, người dùng phải đủ 12 tuổi trở lên"
      ),
    check("gender")
      .notEmpty()
      .withMessage("Yêu cầu giới tính")
      .isIn(["male", "female"])
      .withMessage(
        "Giới tính phải là male danh cho nam hoặc female dành cho nữ"
      ),
    check("phone")
      .isLength({ min: 10, max: 11 })
      .withMessage(
        "Số điện thoại phải chứa 10 hoặc 11 chữ số"
      )
      .isNumeric()
      .withMessage("Số điện thoại không hợp lệ")
      .optional({ nullable: true }),
  ];
}

export default validateRegister;
