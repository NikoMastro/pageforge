const cors = require("cors");

const corsMiddleware = (allowedSubstring) => {
  const allowedOrigins = [
    /localhost:\d+$/,
    /\.run\.app$/,
    /\.pageforge\.work$/,
    /\.bark\.games$/,
  ];

  if (allowedSubstring) {
    allowedOrigins.push(new RegExp(allowedSubstring));
  }

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin matches any allowed pattern
      const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        // Don't throw error, just don't allow
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["Content-Length", "Content-Type", "X-Request-Id"],
    maxAge: 86400, // 24 hours - cache preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
};

module.exports = corsMiddleware;
