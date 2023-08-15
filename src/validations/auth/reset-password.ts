import { check } from "express-validator";

function validateResetPassword() {
  return [
    check("email")
      .notEmpty()
      .withMessage("Yêu cầu email tài khoản")
      .isEmail()
      .withMessage("Email tài khoản không đúng định dạng"),
    check("code")
      .notEmpty()
      .withMessage("Yêu cầu mã xác minh")
      .isNumeric()
      .withMessage("Mã xác minh không hợp lệ"),
    check("password")
      .notEmpty()
      .withMessage("Yêu cầu mật khẩu")
      .isLength({ min: 6, max: 20 })
      .withMessage(
        "Mật khẩu phải có độ dài ít nhất 6 ký tự và nhiều nhất 20 ký tự"
      ),
  ];
}

export default validateResetPassword;
