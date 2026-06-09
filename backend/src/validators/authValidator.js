const Joi = require("joi");

const signupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required"
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  signupSchema,
  loginSchema
};
