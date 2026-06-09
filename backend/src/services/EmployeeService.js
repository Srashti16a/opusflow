const EmployeeRepository = require("../repositories/EmployeeRepository");
const AuditService = require("./AuditService");

class EmployeeService {
  async getProfileById(id) {
    return EmployeeRepository.findById(id);
  }

  async getProfileByUserId(userId) {
    return EmployeeRepository.findByUserId(userId);
  }

  async createProfile(data, skills, imageUrls, performedBy) {
    const profile = await EmployeeRepository.createProfile(data, skills, imageUrls);
    
    // Audit log
    await AuditService.logAction(
      "employee_profiles",
      "INSERT",
      profile.id,
      null,
      profile,
      performedBy
    );

    return profile;
  }

  async updateProfile(id, data, skills, imageUrls, performedBy) {
    const oldProfile = await EmployeeRepository.findById(id);
    if (!oldProfile) {
      const error = new Error("Employee profile not found");
      error.statusCode = 404;
      throw error;
    }

    const newProfile = await EmployeeRepository.updateProfile(id, data, skills, imageUrls);

    // Audit log
    await AuditService.logAction(
      "employee_profiles",
      "UPDATE",
      id,
      oldProfile,
      newProfile,
      performedBy
    );

    return newProfile;
  }

  async deleteProfile(id, performedBy) {
    const oldProfile = await EmployeeRepository.findById(id);
    if (!oldProfile) {
      const error = new Error("Employee profile not found");
      error.statusCode = 404;
      throw error;
    }

    await EmployeeRepository.deleteProfile(id);

    // Audit log
    await AuditService.logAction(
      "employee_profiles",
      "DELETE",
      id,
      oldProfile,
      null,
      performedBy
    );

    return { message: "Employee profile deleted successfully" };
  }

  async getAllProfiles(filters) {
    const limit = filters.limit ? parseInt(filters.limit) : undefined;
    const page = filters.page ? parseInt(filters.page) : undefined;
    const offset = limit && page ? (page - 1) * limit : undefined;

    return EmployeeRepository.findAll({
      search: filters.search,
      limit,
      offset,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      departmentId: filters.departmentId
    });
  }

  async getDashboardStats() {
    return EmployeeRepository.getDashboardStats();
  }

  async getJoins() {
    return EmployeeRepository.getJoinsRaw();
  }

  async getSummaryView() {
    return EmployeeRepository.getEmployeeSummaryView();
  }
}

module.exports = new EmployeeService();
