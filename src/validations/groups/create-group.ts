import { check } from "express-validator";

function validateCreateGroup() {
  return [
    check("name").notEmpty().withMessage("Yêu cầu tên nhóm"),
    check("memberIds")
      .notEmpty()
      .withMessage("Yêu cầu danh sách id của người dùng để tạo nhóm"),
  ];
}

export default validateCreateGroup;
