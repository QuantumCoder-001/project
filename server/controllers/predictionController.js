const HealthRecord = require("../models/HealthRecord");
const axios = require("axios");
const FormData = require("form-data"); // NEW: Required to forward files

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// 1. Health check (Checks if ML service is awake)
const checkHealth = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error("Health Check Proxy Failed:", error.message);
    res.status(503).json({ status: "offline" });
  }
};

// 2. Predict symptoms
const predictSymptoms = async (req, res) => {
  try {
    const { symptoms, age, temperature, bp } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "At least one symptom is required" });
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, { symptoms }, { timeout: 60000 });
    const predictions = mlResponse.data;

    await HealthRecord.create({
      user: req.user._id,
      symptoms,
      age,
      temperature,
      bp,
      predictions,
      predictionType: "symptoms",
      createdAt: new Date()
    });

    res.status(201).json(predictions);
  } catch (error) {
    console.error("ML Prediction Error:", error.message);
    res.status(500).json({ success: false, message: "ML service is unavailable" });
  }
};

// 3. Predict report
const predictReport = async (req, res) => {
  try {
    const { report_data, age, bp } = req.body;

    if (!report_data) {
      return res.status(400).json({ message: "Blood report data is required" });
    }

    const payload = {};
    for (const key in report_data) {
      payload[key] = parseFloat(report_data[key]) || 0;
    }

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-report`, {
      ...payload,
      age: parseFloat(age) || 0,
      bp: bp
    }, { timeout: 60000 });

    const predictions = mlResponse.data;

    await HealthRecord.create({
      user: req.user._id,
      age,
      bp,
      reportData: payload,
      predictions,
      predictionType: "blood_report",
      createdAt: new Date()
    });

    res.status(201).json(predictions);
  } catch (error) {
    console.error("ML Report Prediction Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || "Report prediction failed"
    });
  }
};

/**
 * 4. UPDATED: Predict X-ray
 * Forwards image from frontend to ML service and saves the Top 3 results
 */
const predictXray = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "X-ray image is required" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict-xray`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 120000
    });

    // mlResponse.data is now already an array of Top 3 predictions
    const predictions = mlResponse.data;

    // Save to database
    await HealthRecord.create({
      user: req.user._id,
      age: req.body.age,
      bp: req.body.bp,
      predictions: predictions, // Removed brackets [] because it's already an array
      predictionType: "xray",
      createdAt: new Date()
    });

    res.status(201).json(predictions);
  } catch (error) {
    console.error("X-ray Prediction Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "X-ray analysis failed" });
  }
};

// 5. Get symptoms list
const getSymptomsList = async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/symptoms`, { timeout: 60000 });
    res.json(response.data);
  } catch (error) {
    console.error("Failed to fetch symptoms:", error.message);
    res.status(500).json({ message: "Could not load symptoms" });
  }
};

// 6. History and Records
const getHistory = async (req, res) => {
  try {
    const records = await HealthRecord.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch {
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

const getRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

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
  predictXray, // Export the new function
  getSymptomsList,
  getHistory,
  getRecord,
  deleteRecord
};