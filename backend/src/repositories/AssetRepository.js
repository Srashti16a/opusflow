const prisma = require("../config/db");

class AssetRepository {
  async findById(id) {
    return prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        allocations: {
          include: {
            employee: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        },
        history: true
      }
    });
  }

  async findByCode(assetCode) {
    return prisma.asset.findFirst({
      where: { assetCode }
    });
  }

  async createAsset(data) {
    return prisma.asset.create({
      data: {
        assetCode: data.assetCode,
        assetName: data.assetName,
        assetType: data.assetType,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: parseFloat(data.purchaseCost),
        status: data.status || "Available"
      }
    });
  }

  async updateAsset(id, data) {
    return prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        assetCode: data.assetCode,
        assetName: data.assetName,
        assetType: data.assetType,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : undefined,
        status: data.status
      }
    });
  }

  async deleteAsset(id) {
    return prisma.asset.delete({
      where: { id: parseInt(id) }
    });
  }

  async findAll({ search, limit, offset, sortBy, sortOrder, status, assetType }) {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (assetType) {
      where.assetType = assetType;
    }

    if (search) {
      where.OR = [
        { assetCode: { contains: search, mode: "insensitive" } },
        { assetName: { contains: search, mode: "insensitive" } },
        { assetType: { contains: search, mode: "insensitive" } }
      ];
    }

    const order = {};
    if (sortBy) {
      order[sortBy] = sortOrder || "asc";
    } else {
      order.purchaseDate = "desc";
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        allocations: {
          where: { status: "allocated" },
          include: {
            employee: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          }
        }
      },
      orderBy: order,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    });

    const total = await prisma.asset.count({ where });

    return { assets, total };
  }

  // Allocations
  async createAllocation(assetId, employeeId, allocatedBy, allocatedDate) {
    // 1. Create allocation record
    const allocation = await prisma.assetAllocation.create({
      data: {
        assetId: parseInt(assetId),
        employeeId: parseInt(employeeId),
        allocatedBy: parseInt(allocatedBy),
        allocatedDate: new Date(allocatedDate),
        status: "allocated"
      }
    });

    // 2. Update asset status
    await prisma.asset.update({
      where: { id: parseInt(assetId) },
      data: { status: "Allocated" }
    });

    return allocation;
  }

  async findActiveAllocation(assetId) {
    return prisma.assetAllocation.findFirst({
      where: {
        assetId: parseInt(assetId),
        status: "allocated"
      }
    });
  }

  async returnAllocation(allocationId, returnDate) {
    const allocation = await prisma.assetAllocation.update({
      where: { id: parseInt(allocationId) },
      data: {
        returnDate: new Date(returnDate),
        status: "returned"
      }
    });

    // Update asset status back to Available
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: "Available" }
    });

    return allocation;
  }

  // History
  async createHistory(assetId, action, remarks, createdBy) {
    return prisma.assetHistory.create({
      data: {
        assetId: parseInt(assetId),
        action,
        remarks,
        createdBy: parseInt(createdBy)
      }
    });
  }

  async getHistoryByAsset(assetId) {
    return prisma.assetHistory.findMany({
      where: { assetId: parseInt(assetId) },
      orderBy: { createdAt: "desc" }
    });
  }
}

module.exports = new AssetRepository();
