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
router.post("/", verifyToken, authorize("admin", "manager"), validate(createAssetSchema), AssetController.createAsset);
router.put("/:id", verifyToken, authorize("admin", "manager"), validate(createAssetSchema), AssetController.updateAsset);
router.delete("/:id", verifyToken, authorize("admin", "manager"), AssetController.deleteAsset);
router.post("/:id/allocate", verifyToken, authorize("admin", "manager"), validate(allocateAssetSchema), AssetController.allocateAsset);
router.post("/:id/return", verifyToken, authorize("admin", "manager"), AssetController.returnAsset);
router.get("/:id/history", verifyToken, authorize("admin", "manager"), AssetController.getAssetHistory);

module.exports = router;
