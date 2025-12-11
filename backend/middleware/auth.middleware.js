import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Access Token Provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Remove password from user object
      delete user.password;
      
      req.user = user; // Attach user to request object for further use
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access Token Expired" });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Access Token" });
  }
};

export const sellerRoute = async (req, res, next) => {
  try {
    // console.log("Seller route accessed by user:", req.user?.colonyName);
    if (req.user.role !== "seller" || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Sellers Only" });
    }
    next();
  } catch (error) {
    console.error("Error in sellerRoute middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const buyerRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new Error("No Access Token Provided");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findByIdNoPassword(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user; // Attach user to request object for further use
    // console.log("Buyer route accessed by user:", req.user?.colony_name);
    next();
  } catch (error) {
    // console.error("Error in buyerRoute middleware:", error);
    req.user = null;
    next();
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin Only" });
    }
    next();
  } catch (error) {
    console.error("Error in adminRoute middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};