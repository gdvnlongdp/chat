import { check } from "express-validator";

function validateBlockUser() {
  return [
    check("userId")
      .notEmpty()
      .withMessage("Yêu cầu id của người dùng cần chặn"),
  ];
}

export default validateBlockUser;
