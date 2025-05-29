import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Map route works!" });
});

// securely gets geocode using API key and hides it from the frontend
router.get("/api/geocode", async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`,
      {
        params: {
          key: process.env.MAPTILER_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.log("Error in geocode route", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;
