import Joi from "joi";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const complaintValidationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string()
    .valid(
      "electricity",
      "cleaning",
      "water",
      "maintenance",
      "security",
      "internet",
      "furniture",
      "other"
    )
    .required(),
  priority: Joi.number().min(1).max(5).default(3),
});
