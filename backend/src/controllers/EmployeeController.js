const EmployeeService = require("../services/EmployeeService");
const upload = require("../config/multer");

class EmployeeController {
  async getProfileById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const profile = await EmployeeService.getProfileById(id);
      if (!profile) {
        return res.status(404).json({ message: "Employee profile not found" });
      }
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await EmployeeService.getProfileByUserId(userId);
      if (!profile) {
        return res.status(404).json({ message: "Employee profile not found" });
      }
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async createProfile(req, res, next) {
    try {
      const { userId, departmentId, phone, address, designation, salary, skills, imageUrls } = req.body;
      const performedBy = req.user.id;
      const profile = await EmployeeService.createProfile(
        { userId, departmentId, phone, address, designation, salary },
        skills,
        imageUrls,
        performedBy
      );
      res.status(201).json({
        message: "Employee profile created successfully",
        profile
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const { userId, departmentId, phone, address, designation, salary, skills, imageUrls } = req.body;
      const performedBy = req.user.id;
      const profile = await EmployeeService.updateProfile(
        id,
        { userId, departmentId, phone, address, designation, salary },
        skills,
        imageUrls,
        performedBy
      );
      res.json({
        message: "Employee profile updated successfully",
        profile
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteProfile(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const performedBy = req.user.id;
      const result = await EmployeeService.deleteProfile(id, performedBy);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllProfiles(req, res, next) {
    try {
      const { search, limit, page, sortBy, sortOrder, departmentId } = req.query;
      const result = await EmployeeService.getAllProfiles({
        search,
        limit,
        page,
        sortBy,
        sortOrder,
        departmentId
      });
      res.json(result); // Contains { employees, total }
    } catch (err) {
      next(err);
    }
  }

  async uploadImages(req, res, next) {
    const uploadHandler = upload.array("images", 5);
    uploadHandler(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
      res.json({ imageUrls });
    });
  }

  async getStats(req, res, next) {
    try {
      const stats = await EmployeeService.getDashboardStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async getJoins(req, res, next) {
    try {
      const joins = await EmployeeService.getJoins();
      res.json(joins);
    } catch (err) {
      next(err);
    }
  }

  async getSummaryView(req, res, next) {
    try {
      const viewData = await EmployeeService.getSummaryView();
      res.json(viewData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EmployeeController();
