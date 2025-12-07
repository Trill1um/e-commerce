import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { getPool, testConnection } from "./lib/db.js";
import { ensureMySQLRunning } from "./lib/check.db.js";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import adminRoutes from "./routes/admin.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Risky but only for Project so OK
app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookies
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Log all requests
app.use((req, res, next) => {
  console.log(`🚀 ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', async (req, res) => {
  try {
    await getPool().query('SELECT 1');
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
      console.error('Could not connect to MySQL.');
      process.exit(1);
    }
    
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Database connection failed.');
      process.exit(1);
    }

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/admin", adminRoutes);
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\nServer is running on port', PORT);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down...');
  await getPool().end();
  console.log('Database connections closed');
  process.exit(0);
});

startServer();