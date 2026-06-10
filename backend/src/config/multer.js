const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadDir = path.resolve(__dirname, "../../../uploads");

// Ensure base upload directory exists
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subdirectory based on query parameter or body parameter, fallback to 'employees'
    const subfolder = req.query.folder || req.body.folder || "employees";
    
    // Whitelist subfolders for security
    const allowedSubfolders = ["employees", "documents", "certificates", "assets"];
    const folder = allowedSubfolders.includes(subfolder) ? subfolder : "employees";
    
    const targetDir = path.join(baseUploadDir, folder);
    
    // Ensure target subdirectory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Type Filter (supports images and standard enterprise documents)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif, webp) and documents (pdf, doc, docx) are allowed!"));
  }
};

// Multer Upload Instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file limit
  }
});

module.exports = upload;
