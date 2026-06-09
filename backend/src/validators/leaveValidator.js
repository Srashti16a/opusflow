const Joi = require("joi");

const applyLeaveSchema = Joi.object({
  leaveType: Joi.string().valid("Sick Leave", "Casual Leave", "Paid Leave", "Unpaid Leave").required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref("startDate")).required().messages({
    "date.greater": "End date must be after start date"
  }),
  reason: Joi.string().trim().min(5).required()
});

const rejectLeaveSchema = Joi.object({
  rejectionReason: Joi.string().trim().min(3).required().messages({
    "any.required": "Rejection comments are mandatory",
    "string.min": "Rejection comment must be at least 3 characters long"
  })
});

module.exports = {
  applyLeaveSchema,
  rejectLeaveSchema
};
