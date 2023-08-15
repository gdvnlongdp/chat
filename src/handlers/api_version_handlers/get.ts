import { RequestHandler } from "express";
import { ApiVersion } from "../../models/api-version";

export const get: RequestHandler = async (req, res, next) => {
  try {
    const apiVersion = await ApiVersion.findOne();
    res.json(apiVersion);
  } catch (e) {
    console.log(e);
    next(e);
  }
};
