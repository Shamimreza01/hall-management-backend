import Joi from "joi";

export const hallClearanceValidationSchema = Joi.object({
  clearanceReason: Joi.string()
    .valid("semesterFinal", "deallocation", "others")
    .required(),
  semester: Joi.number().min(1).max(12).when("clearanceReason", {
    is: "semesterFinal",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  year: Joi.number().required(),
  reasonDetails: Joi.string().trim().min(5).when("clearanceReason", {
    is: "others",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
