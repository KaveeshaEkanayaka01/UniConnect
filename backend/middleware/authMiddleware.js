import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const normalizeRole = (role) => {
  const value = String(role || "").trim().toUpperCase();
  if (value === "SYSTEM_ADMIN" || value === "ADMIN") return "SYSTEM_ADMIN";
  if (value === "CLUB_ADMIN") return "CLUB_ADMIN";
  return "STUDENT";
};

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: "This account has been deactivated" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  const allowedRoles = roles.map(normalizeRole);
  const currentRole = normalizeRole(req.user?.role);

  if (!req.user || !allowedRoles.includes(currentRole)) {
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  }

  next();
};
