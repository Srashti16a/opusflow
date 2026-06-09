const AssetRepository = require("../repositories/AssetRepository");
const EmployeeRepository = require("../repositories/EmployeeRepository");
const NotificationService = require("./NotificationService");
const AuditService = require("./AuditService");

class AssetService {
  async getAssetById(id) {
    return AssetRepository.findById(id);
  }

  async createAsset(data, performedBy) {
    const asset = await AssetRepository.createAsset(data);

    // Audit log
    await AuditService.logAction(
      "assets",
      "INSERT",
      asset.id,
      null,
      asset,
      performedBy
    );

    // Write history
    await AssetRepository.createHistory(
      asset.id,
      "Created",
      `Asset created with code ${asset.assetCode} and status Available`,
      performedBy
    );

    return asset;
  }

  async updateAsset(id, data, performedBy) {
    const oldAsset = await AssetRepository.findById(id);
    if (!oldAsset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    const newAsset = await AssetRepository.updateAsset(id, data);

    // Audit log
    await AuditService.logAction(
      "assets",
      "UPDATE",
      id,
      oldAsset,
      newAsset,
      performedBy
    );

    // Write history
    if (oldAsset.status !== newAsset.status) {
      await AssetRepository.createHistory(
        id,
        "Status Changed",
        `Status updated from ${oldAsset.status} to ${newAsset.status}`,
        performedBy
      );
    }

    return newAsset;
  }

  async deleteAsset(id, performedBy) {
    const oldAsset = await AssetRepository.findById(id);
    if (!oldAsset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    await AssetRepository.deleteAsset(id);

    // Audit log
    await AuditService.logAction(
      "assets",
      "DELETE",
      id,
      oldAsset,
      null,
      performedBy
    );

    return { message: "Asset deleted successfully" };
  }

  async getAllAssets(filters) {
    const limit = filters.limit ? parseInt(filters.limit) : undefined;
    const page = filters.page ? parseInt(filters.page) : undefined;
    const offset = limit && page ? (page - 1) * limit : undefined;

    return AssetRepository.findAll({
      search: filters.search,
      limit,
      offset,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      status: filters.status,
      assetType: filters.assetType
    });
  }

  async allocateAsset(assetId, employeeId, performedBy) {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    if (asset.status !== "Available") {
      const error = new Error(`Asset is not available for allocation. Current status is: ${asset.status}`);
      error.statusCode = 400;
      throw error;
    }

    const employee = await EmployeeRepository.findById(employeeId);
    if (!employee) {
      const error = new Error("Employee profile not found");
      error.statusCode = 404;
      throw error;
    }

    const allocation = await AssetRepository.createAllocation(
      assetId,
      employeeId,
      performedBy,
      new Date()
    );

    // Write history
    await AssetRepository.createHistory(
      assetId,
      "Allocated",
      `Allocated to employee ${employee.user?.name || "ID " + employeeId}`,
      performedBy
    );

    // Audit log
    const updatedAsset = await AssetRepository.findById(assetId);
    await AuditService.logAction(
      "assets",
      "UPDATE",
      assetId,
      asset,
      updatedAsset,
      performedBy
    );

    // Send Notification to Employee
    if (employee.userId) {
      await NotificationService.notify(
        employee.userId,
        "Asset Allocated",
        `Corporate asset '${asset.assetName}' (${asset.assetCode}) has been allocated to you successfully.`
      );
    }

    return allocation;
  }

  async returnAsset(assetId, performedBy) {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }

    const activeAllocation = await AssetRepository.findActiveAllocation(assetId);
    if (!activeAllocation) {
      const error = new Error("No active allocation found for this asset");
      error.statusCode = 400;
      throw error;
    }

    const employee = await EmployeeRepository.findById(activeAllocation.employeeId);

    const allocation = await AssetRepository.returnAllocation(
      activeAllocation.id,
      new Date()
    );

    // Write history
    await AssetRepository.createHistory(
      assetId,
      "Returned",
      `Returned by employee ${employee?.user?.name || "ID " + activeAllocation.employeeId}`,
      performedBy
    );

    // Audit log
    const updatedAsset = await AssetRepository.findById(assetId);
    await AuditService.logAction(
      "assets",
      "UPDATE",
      assetId,
      asset,
      updatedAsset,
      performedBy
    );

    // Send Notification to Employee
    if (employee?.userId) {
      await NotificationService.notify(
        employee.userId,
        "Asset Returned",
        `Corporate asset '${asset.assetName}' (${asset.assetCode}) has been marked as returned.`
      );
    }

    return allocation;
  }

  async getAssetHistory(assetId) {
    return AssetRepository.getHistoryByAsset(assetId);
  }
}

module.exports = new AssetService();
