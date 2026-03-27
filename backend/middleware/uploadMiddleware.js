import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve("uploads", "certificates");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadRoot, { recursive: true });
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeBase = path
      .basename(file.originalname || "certificate", ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 80);
    const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase || "certificate"}-${stamp}${ext || ".png"}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed for certificate upload."));
  }
  cb(null, true);
};

export const uploadCertificateImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
