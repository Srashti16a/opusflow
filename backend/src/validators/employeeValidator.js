const Joi = require("joi");

const employeeProfileSchema = Joi.object({
  userId: Joi.number().integer().required(),
  departmentId: Joi.number().integer().required(),
  phone: Joi.string().max(20).allow("", null),
  address: Joi.string().allow("", null),
  designation: Joi.string().max(100).required(),
  salary: Joi.number().precision(2).positive().allow(0, null),
  skills: Joi.array().items(Joi.number().integer()).default([]),
  imageUrls: Joi.array().items(Joi.string()).default([])
});

module.exports = {
  employeeProfileSchema
};
