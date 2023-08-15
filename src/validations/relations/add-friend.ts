import { check } from "express-validator";

function validateAddFriend() {
  return [
    check("userId")
      .notEmpty()
      .withMessage("Yêu cầu id của người dùng cần kết bạn"),
  ];
}

export default validateAddFriend;
