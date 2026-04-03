const express = require("express");
const multer = require("multer"); // NEW: For handling image uploads
const {
  predictSymptoms,
  predictReport,
  predictXray,      // NEW: Added this
  getHistory,
  getRecord,
  deleteRecord,
  getSymptomsList,
  checkHealth
} = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Multer Configuration for X-ray Images ---
// We store the file in memory temporarily before sending it to the ML service
const storage = multer.memoryStorage();
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Health check route for the frontend status indicator
router.get("/health", checkHealth);

// Route to fetch the symptoms list from the ML service
router.get("/symptoms", getSymptomsList);

// Prediction Routes
router.post("/symptoms", protect, predictSymptoms);
router.post("/report", protect, predictReport);

// NEW: X-ray Prediction Route (Uses multer middleware)
router.post("/xray", protect, upload.single('file'), predictXray);

// History Management
router.get("/history", protect, getHistory);
router.get("/:id", protect, getRecord);
router.delete("/:id", protect, deleteRecord);

module.exports = router;