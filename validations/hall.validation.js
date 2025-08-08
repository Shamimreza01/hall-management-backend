import Joi from "joi";

export const hallValidationSchema = Joi.object({
  name: Joi.string().trim().required().min(3).max(50),
  gender: Joi.string().valid("male", "female").required(),
  location: Joi.string().required(),
  description: Joi.string().allow(""),
  totalFloors: Joi.number().integer().min(1).required(),
  totalBlocks: Joi.number().integer().min(1).default(4),
  monthlyRent: Joi.number().min(0).required(),
  contactEmail: Joi.string().email().required(),
  contactPhone: Joi.string()
    .pattern(/^\+880[0-9]{10}$/)
    .required(),
  facilities: Joi.array().items(Joi.string()).default([]),
  isActive: Joi.boolean().required(),
});
