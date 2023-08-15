import mongoose from "mongoose";

function init(): void {
  // Bật strict query
  mongoose.set("strictQuery", true);

  // Khi trả về json, object sẽ là id thay vì _id
  mongoose.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.time;
      const createdAt = new Date(ret.createdAt);
      const updatedAt = new Date(ret.updatedAt);

      createdAt.setHours(createdAt.getHours() + 7);
      updatedAt.setHours(updatedAt.getHours() + 7);

      ret.createdAt = createdAt;
      ret.updatedAt = updatedAt;
      return ret;
    },
  });
}

export default init;
