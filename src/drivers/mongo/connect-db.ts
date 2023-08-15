import mongoose from "mongoose";
import logger from "../../utils/logger";

function connectDbByStringUrl(connectionString: string): void {
  mongoose
    .connect(connectionString)
    .then(() => logger.info("Kết nối thành công với MongoDb"))
    .catch((err) => {
      logger.error("Kết nối tới MongoDb thất bại");
      console.log(err);
    });
}

function connectDbByAccount(
  host: string,
  port: number,
  db: string,
  username: string,
  password: string
): void {
  mongoose
    // .connect(`mongodb://${host}:${port}/${db}`, {
    //   authSource: "admin",
    //   auth: { username, password },
    // })
    .connect(`mongodb://${host}:${port}/${db}`)
    .then(() => logger.info("Kết nối thành công với MongoDb"))
    .catch((err) => {
      logger.error("Kết nối tới MongoDb thất bại");
      console.log(err);
    });
}

export { connectDbByStringUrl, connectDbByAccount };
