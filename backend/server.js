import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool from "./lib/db.js";

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

// Connect Routes - AFTER all middleware
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
});
