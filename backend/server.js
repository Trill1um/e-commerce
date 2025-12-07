import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool, { testConnection } from "./lib/db.js";
import { ensureMySQLRunning } from "./lib/check.db.js";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - MUST be before routes
app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookies
  })
);

// JSON parsing middleware - MUST be before routes
app.use(express.json({ limit: "10mb" })); // Add limit for larger payloads
app.use(express.urlencoded({ extended: true }));

// Cookie parser - MUST be before routes
app.use(cookieParser());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message 
    });
  }
});


async function startServer() {
  try {
    // Check if MySQL is running
    console.log('Checking MySQL connection...');
    const mysqlReady = await ensureMySQLRunning();
    
    if (!mysqlReady) {
      console.error('✗ Could not connect to MySQL. Please start XAMPP and try again.');
      process.exit(1);
    }
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('✗ Database connection failed. Check your .env file.');
      process.exit(1);
    }

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n✓ Server is running on port', PORT);
      console.log(`✓ Health check: http://localhost:${PORT}/api/health\n`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  await pool.end();
  console.log('✓ Database connections closed');
  process.exit(0);
});

// Start the server
startServer();



// // Connect Routes - AFTER all middleware
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);

// app.listen(PORT, () => {
//   console.log("Server is running on port ", PORT);
// });
