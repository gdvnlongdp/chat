import express from "express";
import StickerModel from "../models/sticker-model";
import uploader from "../utils/uploader";

const stickerRouter = express.Router();

stickerRouter.post(
  "/",
  uploader.fields([
    { name: "collection" },
    { name: "thum", maxCount: 1 },
  ]),
  async (req, res, next) => {
    const { name } = req.body;
    try {
      // xử lý upload stickers
      const thum = (req.files as any).thum[0];
      const collect = (req.files as any).collection;
      const collectionMap: any[] =
        collect.map((c: any) => {
          return `${req.protocol}://${req.get(
            "host"
          )}/static/${c.filename}`;
        }) || [];

      // cập nhật vào db
      const sticker = new StickerModel({
        name,
        thum: `${req.protocol}://${req.get(
          "host"
        )}/static/${thum.filename}`,
        collect: collectionMap,
      });
      await sticker.save();
      res.sendStatus(201);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

export default stickerRouter;
