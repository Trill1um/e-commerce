import { client } from "../lib/redis.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

//Config: Production = secure-true, sameSite-none; Development = secure-false, sameSite-Strict
const cookieConfiguration = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Strict",
};

const genSetAccessToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    ...cookieConfiguration,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  return accessToken;
};

const genSetRefreshToken = (res, userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieConfiguration,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return refreshToken;
};

const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await client.set(
      `refreshToken:${userId}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 7
    ); // 7 days
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
};

export const login = async (req, res) => {
  try {
    // console.log("Login route activated: ", req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check credentials
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      // console.log("Invalid login attempt for email:", email, isValidPassword);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = genSetAccessToken(res, user.id);
    const refreshToken = genSetRefreshToken(res, user.id);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    // Clean up temp and cooldown tokens
    await client.del(`verify_cooldown:${email}`);

    // console.log("User authenticated successfully:", user);
    return res.status(200).json({
      user: {
        id: user.id,
        colonyName: user.colony_name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updatedAt: user.updated_at
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  const { colonyName, email, password, confirmPassword, role } =
    req.body;
  try {
    // console.log("ChecK: ", req.body)
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials detected" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (role==="seller") {
      if (!colonyName) {
        return res.status(400).json({ message: "Colony name is required for sellers" });
      }
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    let userData;

    if (role==="seller") {
      userData = {
        colonyName,
        email,
        password,
        role,
      };
    } else {
      userData = {
        email,
        password,
        role,
      }
    }

    let userID;
    try {
      userID = await User.create(userData);
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }
    
    const accessToken = genSetAccessToken(res, userID);
    const refreshToken = genSetRefreshToken(res, userID);

    // Store refresh token
    await storeRefreshToken(userID, refreshToken);
    
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({error: error ,message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Remove refresh token from Redis
      await client.del(`refreshToken:${decoded.userId}`);
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.delete(userId);

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    // Check if the refresh token exists in Redis
    const storedToken = await client.get(`refreshToken:${userId}`);
    if (storedToken !== refreshToken) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token only
    genSetAccessToken(res, userId);

    res.status(200).json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    // console.log("getProfile route activated");
    let user=req.user;
    res.status(200).json({
      id: user.id,
      colonyName: user.colony_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updatedAt: user.updated_at
    });
    
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};