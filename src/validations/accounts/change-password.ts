import { check } from "express-validator";

function validateChangePassword() {
  return [
    check("password").notEmpty().withMessage("Yêu cầu mật khẩu cũ"),
    check("newPassword")
      .notEmpty()
      .withMessage("Yêu cầu mật khẩu mới")
      .isLength({ min: 6, max: 20 })
      .withMessage(
        "Mật khẩu phải có độ dài ít nhất 6 ký tự và nhiều nhất 20 ký tự"
      )
      .custom((value, { req }) => {
        if (value === req.body.password) {
          throw new Error("Mật khẩu mới phải không trùng mật khẩu cũ");
        }
        return true;
      }),
  ];
}

export default validateChangePassword;
