const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/EmployeeController");
const verifyToken = require("../middleware/auth");
const validate = require("../middleware/validation");
const { employeeProfileSchema } = require("../validators/employeeValidator");

router.get("/dashboard/stats", verifyToken, EmployeeController.getStats);
router.get("/queries/joins", verifyToken, EmployeeController.getJoins);
router.get("/queries/summary-view", verifyToken, EmployeeController.getSummaryView);
router.post("/upload", verifyToken, EmployeeController.uploadImages);
router.get("/me", verifyToken, EmployeeController.getMyProfile);

router.post("/", verifyToken, validate(employeeProfileSchema), EmployeeController.createProfile);
router.get("/", verifyToken, EmployeeController.getAllProfiles);
router.get("/:id", verifyToken, EmployeeController.getProfileById);
router.put("/:id", verifyToken, validate(employeeProfileSchema), EmployeeController.updateProfile);
router.delete("/:id", verifyToken, EmployeeController.deleteProfile);

module.exports = router;
