import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const roomValidationSchema = Joi.object({
  roomNumber: Joi.string().required(),
  roomType: Joi.string().required(),
  capacity: Joi.number().required(),
  floor: Joi.number().required(),
});

export const roomRangeSchema = Joi.object({
  startRoom: Joi.number().required(),
  endRoom: Joi.number().required(),
  roomType: Joi.string().required(),
  capacity: Joi.number().min(1).required(),
  floor: Joi.number().min(0).required(),
});
