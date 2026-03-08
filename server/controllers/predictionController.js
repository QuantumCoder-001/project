const HealthRecord = require("../models/HealthRecord");
const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// Health check (Checks if Render ML service is awake)
const checkHealth = async (req, res) => {
  try {
    // Increase timeout to 60s for Render cold starts
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error("Health Check Proxy Failed:", error.message);
    res.status(503).json({ status: "offline" });
  }
};

// Predict symptoms
const predictSymptoms = async (req, res) => {
  try {
    const { symptoms, age, temperature, bp } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "At least one symptom is required" });
    }

    // Added 60s timeout for cold starts
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, { symptoms }, { timeout: 60000 });
    const predictions = mlResponse.data;

    const record = await HealthRecord.create({
      user: req.user._id,
      symptoms,
      age,
      temperature,
      bp,
      predictions,
      predictionType: "symptoms",
      createdAt: new Date()
    });

    res.status(201).json({ success: true, predictions });

  } catch (error) {
    console.error("ML Prediction Error:", error.message);
    res.status(500).json({
      success: false,
      message: "ML service is unavailable"
    });
  }
};

// Predict report
const predictReport = async (req, res) => {
  try {
    const { report_data, age, bp } = req.body;

    if (!report_data) {
      return res.status(400).json({ message: "Blood report data is required" });
    }

    // Added 60s timeout for cold starts
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-report`, {
      ...report_data,
      age,
      bp
    }, { timeout: 60000 });

    const predictions = mlResponse.data;

    const formattedReportData = {};
    for (const key in report_data) {
      formattedReportData[key] = parseFloat(report_data[key]);
    }

    const record = await HealthRecord.create({
      user: req.user._id,
      age,
      bp,
      reportData: formattedReportData, // Use the converted numeric data
      predictions,
      predictionType: "blood_report",
      createdAt: new Date()
    });

    res.status(201).json({ success: true, predictions });

  } catch (error) {
    console.error("ML Report Prediction Error:", error.message);
    res.status(500).json({ success: false, message: "Report prediction failed" });
  }
};

// Get symptoms list from ML service
const getSymptomsList = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/symptoms`, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error("Failed to fetch symptoms:", error.message);
    res.status(500).json({ message: "Could not load symptoms" });
  }
};

// Get user history
const getHistory = async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

// Get single record
const getRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete record
const deleteRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  checkHealth,
  predictSymptoms,
  predictReport,
  getSymptomsList,
  getHistory,
  getRecord,
  deleteRecord
};