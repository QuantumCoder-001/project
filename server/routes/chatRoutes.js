const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: message }] }],
    });

    res.json({
      reply: response.text,
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ reply: "AI error occurred." });
  }
});

module.exports = router;
