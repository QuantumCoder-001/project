const express = require("express");
const { 
  predictSymptoms,
  getHistory,
  getRecord,
  deleteRecord
} = require("../controllers/predictionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/symptoms", protect, predictSymptoms);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getRecord);
router.delete("/:id", protect, deleteRecord);

module.exports = router;