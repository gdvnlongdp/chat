import { check } from "express-validator";

function validateLogin() {
  return [
    check("email").notEmpty().withMessage("Yêu cầu tên tài khoản"),
    check("password").notEmpty().withMessage("Yêu cầu mật khẩu"),
  ];
}

export default validateLogin;
