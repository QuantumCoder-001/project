const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Try to call the ML service
        const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
        res.json({ 
            status: 'connected', 
            ml_service: response.data,
            message: 'ML service is running'
        });
    } catch (error) {
        console.log('ML Service health check failed:', error.message);
        res.json({ 
            status: 'disconnected', 
            message: 'ML service not available',
            error: error.message 
        });
    }
});

// Get list of all symptoms from the ML model
router.get('/symptoms', async (req, res) => {
    try {
        // First try to get from ML service if it has an endpoint
        try {
            const mlResponse = await axios.get(`${ML_SERVICE_URL}/symptoms`, { timeout: 2000 });
            return res.json({ 
                success: true, 
                symptoms: mlResponse.data 
            });
        } catch (mlError) {
            console.log('Could not get symptoms from ML service, reading from file...');
        }

        // Fallback: Read from the symptom_features.json file
        // Adjust the path to your ml-model folder
        const featuresPath = path.join(__dirname, '../../ml-model/symptons/symptom_features.json');
        console.log('Reading symptoms from:', featuresPath);
        
        const featuresData = fs.readFileSync(featuresPath, 'utf8');
        const features = JSON.parse(featuresData);
        
        res.json({ 
            success: true, 
            symptoms: features 
        });
    } catch (error) {
        console.error('Error reading symptoms:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Could not load symptoms',
            details: error.message 
        });
    }
});

// Make prediction
router.post('/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        
        if (!symptoms || !Array.isArray(symptoms)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Symptoms must be provided as an array' 
            });
        }
        
        console.log('Sending to ML service:', { symptoms });
        
        // Call Python ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
            symptoms: symptoms
        });
        
        console.log('ML service response:', mlResponse.data);
        
        // Format response for frontend
        const formattedPredictions = mlResponse.data.map(pred => ({
            disease: pred.disease,
            confidence: pred.confidence,
            probability: parseFloat(pred.confidence) / 100
        }));
        
        res.json({
            success: true,
            predictions: formattedPredictions
        });
        
    } catch (error) {
        console.error('ML Service Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Prediction failed',
            details: error.response?.data || error.message 
        });
    }
});

module.exports = router;