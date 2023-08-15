import { check } from "express-validator";

function validateUpdateProfile() {
  return [
    check("name")
      .isAlpha("vi-VN", { ignore: " " })
      .withMessage(
        "Tên người dùng không hợp lệ, chỉ bao gồm chữ cái và khoảng trắng"
      )
      .optional({ nullable: true }),
    check("dob")
      .isAfter("1900-01-01")
      .withMessage("Ngày sinh phải từ thời điểm 1900-01-01 trở về sau")
      .isBefore(new Date(Date.now() - 378683424000).toString()) // Trước ngày hiện tại trừ đi 12 năm
      .withMessage("Ngày sinh không hợp lệ, người dùng phải đủ 12 tuổi trở lên")

      .optional({ nullable: true }),

    check("gender")
      .isIn(["male", "female"])
      .withMessage(
        "Giới tính phải là male danh cho nam hoặc female dành cho nữ"
      )
      .optional({ nullable: true }),
    check("phone")
      .isLength({ min: 10, max: 11 })
      .withMessage("Số điện thoại phải chứa 10 hoặc 11 chữ số")
      .isNumeric()
      .withMessage("Số điện thoại không hợp lệ")
      .optional({ nullable: true }),
  ];
}

export default validateUpdateProfile;
