import { RequestHandler } from "express";
import { ApiVersion } from "../../models/api-version";

export const write: RequestHandler = async (req, res, next) => {
  const { android, ios }: { android: string; ios: string } = req.body;

  try {
    const apiVersion = await ApiVersion.findOneAndUpdate(
      {},
      {
        $set: {
          android,
          ios,
        },
      },
      { upsert: true, new: true }
    );

    res.json(apiVersion);
  } catch (e) {
    console.log(e);
    next(e);
  }
};
