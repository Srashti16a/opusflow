const Joi = require("joi");

const createAssetSchema = Joi.object({
  assetCode: Joi.string().trim().required(),
  assetName: Joi.string().trim().max(200).required(),
  assetType: Joi.string().trim().max(100).required(),
  purchaseDate: Joi.date().iso().required(),
  purchaseCost: Joi.number().precision(2).positive().required(),
  status: Joi.string().valid("Available", "Allocated", "Damaged", "Lost").default("Available")
});

const allocateAssetSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  allocatedDate: Joi.date().iso().default(() => new Date())
});

module.exports = {
  createAssetSchema,
  allocateAssetSchema
};
