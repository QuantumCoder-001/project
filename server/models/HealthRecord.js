const mongoose = require("mongoose");

const HealthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // New field to distinguish the source of the prediction
  predictionType: {
    type: String,
    enum: ["symptoms", "blood_report"],
    default: "symptoms",
  },
  // Symptoms is no longer required globally since reports don't use it
  symptoms: [{
    type: String,
  }],
  age: {
    type: Number,
  },
  temperature: {
    type: Number,
  },
  bp: {
    type: String,
  },
  // New field to store the 24 blood parameters
  reportData: {
    type: Object, // Changed from Map of Numbers to a flexible Object
    default: {}
  },
  predictions: [{
    disease: String,
    confidence: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HealthRecord", HealthRecordSchema);