import dotenv from "dotenv";

// Load environment variables FIRST - before any other imports that might use them
dotenv.config();

// Import config after dotenv
import { connectSQLDB, resetSequelize } from "./src/config/sqlDatabase.js";
import { PORT, NODE_ENV } from "./src/utils/constants.js";

// Main async function to start the server
(async () => {
  try {
    // Reset any sequelize instance that might have been created with wrong env vars
    resetSequelize();

    // Connect to SQL Server with Sequelize (PRIMARY DATABASE)
    await connectSQLDB();

    // Import app AFTER database connection to ensure sequelize is initialized with correct config
    const { default: app } = await import("./src/app.js");

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
    ========================================
    Server is running in ${NODE_ENV} mode
    Port: ${PORT}
    URL: http://localhost:${PORT}
    ========================================
  `);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Promise Rejection:", err);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

    // Keep the process alive
    process.stdin.resume();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
