import Joi from "joi";
import mongoose from "mongoose";

// Custom ObjectId validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const provostRegistrationValidation = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().required(),
  profilePhoto: Joi.string(),
  hall: Joi.custom(objectId).required(),
  secretCode: Joi.string().required(),
}).required();

export const studentReistrationValidation = Joi.object({
  roll: Joi.string().required(),
  registration: Joi.string().required(),
  academicSession: Joi.string().required(),
  admissionYear: Joi.number().required(),
  department: Joi.string().required(),
  fatherName: Joi.string().required(),
  motherName: Joi.string().required(),
  fatherPhone: Joi.string().required(),
  emergencyContact: Joi.string().required(),
  permanentAddress: Joi.string().required(),
  bloodGroup: Joi.string().required(),
  medicalInfo: Joi.string().required(),
  hall: Joi.custom(objectId).required(),
  room: Joi.custom(objectId).required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone: Joi.string().required(),
  altPhone: Joi.string().required(),
  profilePhoto: Joi.string(),
  position: Joi.string(),
});
