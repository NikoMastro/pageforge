const express = require("express");
const { EDGE_PURGE_URL, CACHE_INVALIDATION_SECRET } = require("../../config/config");

const router = express.Router();

router.post("/invalidate", async (req, res) => {
  try {
    if (!EDGE_PURGE_URL) {
      return res.status(500).json({
        success: false,
        error: "EDGE_PURGE_URL is not configured",
      });
    }

    if (!CACHE_INVALIDATION_SECRET) {
      return res.status(500).json({
        success: false,
        error: "CACHE_INVALIDATION_SECRET is not configured",
      });
    }

    const edgePurgeUrl = `${EDGE_PURGE_URL}/invalidate-cache`;
    

    const response = await fetch(edgePurgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Cache-Invalidation-Secret": CACHE_INVALIDATION_SECRET,
      },
      body: JSON.stringify(req.body || {}),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`❌ Cache invalidation failed with status ${response.status}:`, responseData);
      return res.status(response.status).json({
        success: false,
        error: "Failed to invalidate cache",
        details: responseData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cache invalidated successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to invalidate cache",
    });
  }
});

module.exports = router;
