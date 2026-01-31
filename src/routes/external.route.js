const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/quote", async (req, res) => {
    try {
    const response = await axios.get("https://zenquotes.io/api/random");

    res.status(200).json({
        source: "Public API (ZenQuotes)",
        content: response.data[0].q,
        author: response.data[0].a
    });
    } catch (error) {
    console.error("External API Error:", error.message);
    res.status(500).json({
        message: "Failed to fetch quote"
    });
    }
});

module.exports = router;
