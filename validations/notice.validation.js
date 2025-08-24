import Joi from "joi";
import mongoose from "mongoose";

// Custom ObjectId validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const noticeValidation = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required(),
  visibility: Joi.string().valid("public", "private").default("public"),
  attachments: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      fileName: Joi.string().required(),
      fileType: Joi.string().required(),
      fileSize: Joi.number().min(0).required(),
    })
  ),
  expiryDate: Joi.date().min("now").optional(),
  isActive: Joi.boolean().default(true),
});
export default noticeValidation;
