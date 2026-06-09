const AssetService = require("../services/AssetService");

class AssetController {
  async getAssetById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const asset = await AssetService.getAssetById(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (err) {
      next(err);
    }
  }

  async createAsset(req, res, next) {
    try {
      const performedBy = req.user.id;
      const asset = await AssetService.createAsset(req.body, performedBy);
      res.status(201).json({
        message: "Asset created successfully",
        asset
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAsset(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const performedBy = req.user.id;
      const asset = await AssetService.updateAsset(id, req.body, performedBy);
      res.json({
        message: "Asset updated successfully",
        asset
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAsset(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const performedBy = req.user.id;
      const result = await AssetService.deleteAsset(id, performedBy);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllAssets(req, res, next) {
    try {
      const { search, limit, page, sortBy, sortOrder, status, assetType } = req.query;
      const result = await AssetService.getAllAssets({
        search,
        limit,
        page,
        sortBy,
        sortOrder,
        status,
        assetType
      });
      res.json(result); // { assets, total }
    } catch (err) {
      next(err);
    }
  }

  async allocateAsset(req, res, next) {
    try {
      const assetId = parseInt(req.params.id);
      const { employeeId } = req.body;
      const performedBy = req.user.id;
      if (!employeeId) {
        return res.status(400).json({ message: "employeeId is required" });
      }
      const allocation = await AssetService.allocateAsset(assetId, employeeId, performedBy);
      res.json({
        message: "Asset allocated successfully",
        allocation
      });
    } catch (err) {
      next(err);
    }
  }

  async returnAsset(req, res, next) {
    try {
      const assetId = parseInt(req.params.id);
      const performedBy = req.user.id;
      const allocation = await AssetService.returnAsset(assetId, performedBy);
      res.json({
        message: "Asset returned successfully",
        allocation
      });
    } catch (err) {
      next(err);
    }
  }

  async getAssetHistory(req, res, next) {
    try {
      const assetId = parseInt(req.params.id);
      const history = await AssetService.getAssetHistory(assetId);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AssetController();
