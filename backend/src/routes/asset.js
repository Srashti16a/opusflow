const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/AssetController");
const verifyToken = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validation");
const { createAssetSchema, allocateAssetSchema } = require("../validators/assetValidator");

router.get("/", verifyToken, AssetController.getAllAssets);
router.get("/:id", verifyToken, AssetController.getAssetById);

// Manager/Admin asset writes
router.post("/", verifyToken, authorize("admin", "manager", "hr"), validate(createAssetSchema), AssetController.createAsset);
router.put("/:id", verifyToken, authorize("admin", "manager", "hr"), validate(createAssetSchema), AssetController.updateAsset);
router.delete("/:id", verifyToken, authorize("admin", "manager", "hr"), AssetController.deleteAsset);
router.post("/:id/allocate", verifyToken, authorize("admin", "manager", "hr"), validate(allocateAssetSchema), AssetController.allocateAsset);
router.post("/:id/return", verifyToken, authorize("admin", "manager", "hr"), AssetController.returnAsset);
router.get("/:id/history", verifyToken, authorize("admin", "manager", "hr"), AssetController.getAssetHistory);

module.exports = router;
