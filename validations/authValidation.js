const Joi = require("joi");

const signupSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  company: Joi.string().required(),
  email: Joi.string().email().required(),
});

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  signupSchema,
  sendOtpSchema,
  verifyOtpSchema,
  loginSchema,
};
