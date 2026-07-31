const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFARE_API_TOKEN } = require("../../config/config");

async function listImages() {
  if (!CLOUDFARE_API_TOKEN) {
    console.warn("Warning: Cloudflare API token is null or undefined.");
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  return data;
}

async function getImage(imageId) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

async function uploadImageFromFile(fileBuffer, filename, metadata = {}) {
  const formData = new FormData();

  // Create a Blob from the buffer and append it as a file
  const blob = new Blob([fileBuffer]);
  formData.append("file", blob, filename);

  // Optional metadata
  if (metadata.metadata) {
    formData.append("metadata", JSON.stringify(metadata.metadata));
  }
  if (metadata.requireSignedURLs !== undefined) {
    formData.append("requireSignedURLs", metadata.requireSignedURLs);
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to upload image: ${response.statusText} - ${JSON.stringify(
        errorData
      )}`
    );
  }

  const data = await response.json();
  return data.result;
}

async function uploadImageFromUrl(imageData) {
  const formData = new FormData();

  // Add URL
  if (imageData.url) {
    formData.append("url", imageData.url);
  } else {
    throw new Error("URL is required for URL-based upload");
  }

  // Optional metadata
  if (imageData.metadata) {
    formData.append("metadata", JSON.stringify(imageData.metadata));
  }
  if (imageData.requireSignedURLs !== undefined) {
    formData.append("requireSignedURLs", imageData.requireSignedURLs);
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to upload image: ${response.statusText} - ${JSON.stringify(
        errorData
      )}`
    );
  }

  const data = await response.json();
  return data.result;
}

async function deleteImage(imageId) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

async function updateImage(imageId, updateData) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update image: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

// Get direct image URL
function getImageDirectUrl(imageId, variant = "public") {
  return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/${variant}`;
}

// ========== STREAM VIDEO FUNCTIONS ==========

async function listVideos(queryParams = {}) {
  const params = new URLSearchParams();

  // Add supported query parameters
  if (queryParams.asc !== undefined) params.append("asc", queryParams.asc);
  if (queryParams.creator) params.append("creator", queryParams.creator);
  if (queryParams.end) params.append("end", queryParams.end);
  if (queryParams.include_counts !== undefined)
    params.append("include_counts", queryParams.include_counts);
  if (queryParams.search) params.append("search", queryParams.search);
  if (queryParams.start) params.append("start", queryParams.start);
  if (queryParams.status) params.append("status", queryParams.status);
  if (queryParams.type) params.append("type", queryParams.type);
  if (queryParams.video_name)
    params.append("video_name", queryParams.video_name);

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream${
    params.toString() ? "?" + params.toString() : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
    },
  });

  const data = await response.json();
  return data;
}

async function getVideo(videoId) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${CLOUDFARE_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

router.get("/listImages", async (req, res) => {
  try {
    const data = await listImages();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/images/:id", async (req, res) => {
  try {
    const image = await getImage(req.params.id);
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image from URL
router.post("/uploadImageFromUrl", async (req, res) => {
  try {
    const image = await uploadImageFromUrl(req.body);
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload images from files (supports multiple files)
router.post(
  "/uploadImageFromFiles",
  upload.array("files"),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadPromises = req.files.map(async (file) => {
        try {
          const result = await uploadImageFromFile(
            file.buffer,
            file.originalname,
            {
              metadata: req.body.metadata
                ? JSON.parse(req.body.metadata)
                : undefined,
              requireSignedURLs: req.body.requireSignedURLs,
            }
          );
          return {
            success: true,
            filename: file.originalname,
            result: result,
          };
        } catch (error) {
          return {
            success: false,
            filename: file.originalname,
            error: error.message,
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      res.status(200).json({
        total: results.length,
        successful: successCount,
        failed: failureCount,
        results: results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete image
router.delete("/deleteImage/:id", async (req, res) => {
  try {
    const result = await deleteImage(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update image access control
router.patch("/updateImage/:id", async (req, res) => {
  try {
    const image = await updateImage(req.params.id, req.body);
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STREAM VIDEO ROUTES ==========

// List videos with optional query parameters
router.get("/listVideos", async (req, res) => {
  try {
    const data = await listVideos(req.query);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single video details
router.get("/videos/:id", async (req, res) => {
  try {
    const video = await getVideo(req.params.id);
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
