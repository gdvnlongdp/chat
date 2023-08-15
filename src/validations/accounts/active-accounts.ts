import { check } from "express-validator";

function validateActiveAccount() {
  return [
    check("email")
      .notEmpty()
      .withMessage("Yêu cầu email tài khoản")
      .isEmail()
      .withMessage("Email tài khoản không đúng định dạng"),
    check("code")
      .notEmpty()
      .withMessage("Yêu cầu mã kích hoạt")
      .isNumeric()
      .withMessage("Mã kích hoạt không hợp lệ"),
  ];
}

export default validateActiveAccount;
