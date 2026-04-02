import bcrypt from "bcryptjs";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import Badge from "../models/Badge.js";
import sendEmail from "../utils/sendEmail.js";
import {
  buildCertificatePayload,
  generateCredentialId,
  signCertificatePayload,
} from "../utils/certificateCredential.js";

const CREDENTIAL_SIGNING_SECRET =
  process.env.CREDENTIAL_SIGNING_SECRET || process.env.JWT_SECRET;

const generateUniqueCredentialId = async (maxAttempts = 5) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateCredentialId();
    const duplicateCredential = await StudentProfile.findOne({
      "certificates.credentialId": candidate,
    }).select("_id");

    if (!duplicateCredential) {
      return candidate;
    }
  }

  throw new Error("Failed to generate a unique credential ID");
};

const getFrontendBaseUrl = (req) => {
  const configuredUrl = (process.env.FRONTEND_PUBLIC_URL || process.env.APP_PUBLIC_URL || "").trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const backendBaseUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  return backendBaseUrl.replace(/:5000\/?$/, ":5173").replace(/\/$/, "");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildRewardEmailHtml = ({ fullName, awardItems, dashboardUrl }) => {
  const safeName = escapeHtml(fullName || "Student");

  const cards = awardItems
    .map((item) => {
      if (item.type === "badge") {
  return `
    <div style="margin:0 0 16px;padding:18px;border:1px solid #bfdbfe;border-radius:18px;background:linear-gradient(135deg,#dbeafe 0%,#ffffff 60%,#eff6ff 100%);">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div style="width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:20px;">🏅</div>
        <div>
          <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;">Badge Awarded</div>
          <div style="font-size:18px;font-weight:800;color:#1e3a8a;margin-top:2px;">${escapeHtml(item.title)}</div>
        </div>
      </div>
      ${item.description ? `<div style="color:#1e40af;font-size:14px;line-height:1.55;margin-top:8px;"><strong style="color:#1e3a8a;">Description:</strong> ${escapeHtml(item.description)}</div>` : ""}
      ${item.criteria ? `<div style="color:#1e40af;font-size:14px;line-height:1.55;margin-top:8px;"><strong style="color:#1e3a8a;">Criteria:</strong> ${escapeHtml(item.criteria)}</div>` : ""}
    </div>`;
}

      return `
        <div style="margin:0 0 16px;padding:18px;border:1px solid #c7d2fe;border-radius:18px;background:linear-gradient(135deg,#eef2ff 0%,#ffffff 55%,#f8fafc 100%);">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
            <div style="width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">🎓</div>
            <div>
              <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#1d4ed8;">Certificate Issued</div>
              <div style="font-size:18px;font-weight:800;color:#0f172a;margin-top:2px;">${escapeHtml(item.title)}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr;gap:8px;color:#334155;font-size:14px;line-height:1.55;">
            ${item.issuer ? `<div><strong style="color:#111827;">Issuer:</strong> ${escapeHtml(item.issuer)}</div>` : ""}
            ${item.credentialId ? `<div><strong style="color:#111827;">Credential ID:</strong> ${escapeHtml(item.credentialId)}</div>` : ""}
            ${item.verificationPageUrl ? `<div><strong style="color:#111827;">Verification:</strong> <a href="${escapeHtml(item.verificationPageUrl)}" style="color:#1d4ed8;text-decoration:none;">Open verification page</a></div>` : ""}
          </div>
        </div>`;
    })
    .join("");

  return `
    <div style="margin:0;padding:0;background:#e2e8f0;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #dbeafe;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.12);font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#dc2626 100%);padding:32px 28px;color:#fff;">
          <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;opacity:.9;">UniConnect Achievement Update</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">Congratulations, ${safeName}!</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,.92);max-width:580px;">You have received a new badge, certificate, or both. Your accomplishment is now recorded in UniConnect and ready to view from your dashboard.</p>
        </div>

        <div style="padding:28px;">
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;">
            <div style="padding:10px 14px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Blue = Achievement</div>
            <div style="padding:10px 14px;border-radius:999px;background:#fef2f2;color:#dc2626;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Red = New Certificate</div>
            <div style="padding:10px 14px;border-radius:999px;background:#f8fafc;color:#111827;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border:1px solid #e2e8f0;">White = Dashboard Ready</div>
          </div>

          ${cards}

          <div style="margin-top:24px;padding:18px 20px;border-radius:18px;background:#0f172a;color:#e2e8f0;">
            <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:6px;">Next step</div>
            <div style="font-size:14px;line-height:1.7;">Log in to your UniConnect dashboard to review the details, see your verified records, and share your achievement with confidence.</div>
            <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;margin-top:14px;padding:12px 18px;border-radius:12px;background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 100%);color:#fff;text-decoration:none;font-weight:800;font-size:14px;">Open Dashboard</a>
          </div>
        </div>

        <div style="padding:18px 28px 28px;color:#64748b;font-size:12px;line-height:1.6;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <strong style="color:#0f172a;">UniConnect</strong> keeps your achievements organized, verified, and easy to access.
        </div>
      </div>
    </div>`;
};

const toYearNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);
    const profiles = await StudentProfile.find({ user: { $in: userIds } })
      .populate("badges")
      .select("user faculty yearOfStudy degreeProgram bio badges certificates joinedClubs");

    const profileByUserId = new Map(
      profiles.map((profile) => [String(profile.user), profile])
    );

    const merged = users.map((user) => {
      const profile = profileByUserId.get(String(user._id));
      return {
        ...user.toObject(),
        profile: profile || null,
      };
    });

    res.status(200).json(merged);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      studentId,
      faculty,
      yearOfStudy,
      role,
      isActive,
      isEmailVerified,
      degreeProgram,
      bio,
    } = req.body;

    if (!fullName || !email || !password || !studentId || !faculty || !yearOfStudy) {
      return res.status(400).json({
        message:
          "fullName, email, password, studentId, faculty, yearOfStudy are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const allowedRoles = ["STUDENT", "CLUB_ADMIN", "SYSTEM_ADMIN"];
    const resolvedRole = allowedRoles.includes(role) ? role : "STUDENT";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      studentId,
      faculty,
      yearOfStudy: String(yearOfStudy),
      role: resolvedRole,
      isActive: typeof isActive === "boolean" ? isActive : true,
      isEmailVerified:
        typeof isEmailVerified === "boolean" ? isEmailVerified : false,
    });

    const profile = await StudentProfile.create({
      user: user._id,
      faculty,
      yearOfStudy: toYearNumber(yearOfStudy),
      degreeProgram: degreeProgram || "",
      bio: bio || "",
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.status(201).json({ user: safeUser, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      fullName,
      email,
      password,
      studentId,
      faculty,
      yearOfStudy,
      role,
      isActive,
      isEmailVerified,
      degreeProgram,
      bio,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email.toLowerCase() !== user.email) {
      const emailInUse = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
      if (emailInUse) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email.toLowerCase();
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (studentId !== undefined) user.studentId = studentId;
    if (faculty !== undefined) user.faculty = faculty;
    if (yearOfStudy !== undefined) user.yearOfStudy = String(yearOfStudy);

    if (role !== undefined) {
      const allowedRoles = ["STUDENT", "CLUB_ADMIN", "SYSTEM_ADMIN"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    if (typeof isActive === "boolean") user.isActive = isActive;
    if (typeof isEmailVerified === "boolean") user.isEmailVerified = isEmailVerified;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const profile = await StudentProfile.findOneAndUpdate(
      { user: user._id },
      {
        ...(faculty !== undefined ? { faculty } : {}),
        ...(yearOfStudy !== undefined ? { yearOfStudy: toYearNumber(yearOfStudy) } : {}),
        ...(degreeProgram !== undefined ? { degreeProgram } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate("badges")
      .populate("skillDetails.skill");

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({ user: safeUser, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    await StudentProfile.findOneAndDelete({ user: userId });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({}).sort({ createdAt: -1 });
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBadge = async (req, res) => {
  try {
    const { title, description, icon, criteria } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Badge title is required" });
    }

    const normalizedTitle = title.trim();
    const existingBadge = await Badge.findOne({
      title: { $regex: `^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (existingBadge) {
      return res.status(400).json({ message: "Badge with this title already exists" });
    }

    const badge = await Badge.create({
      title: normalizedTitle,
      description: description?.trim() || "",
      icon: icon?.trim() || "",
      criteria: criteria?.trim() || "",
    });

    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badgeId, certificateTitle, issuer, verificationUrl } = req.body;

    if (!CREDENTIAL_SIGNING_SECRET) {
      return res.status(500).json({
        message: "Credential signing secret is missing in environment configuration",
      });
    }

    const user = await User.findById(userId).select("fullName email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const awardItems = [];

    if (badgeId) {
      const badge = await Badge.findById(badgeId);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      const alreadyHasBadge = profile.badges.some(
        (id) => String(id) === String(badgeId)
      );

      if (!alreadyHasBadge) {
        profile.badges.push(badgeId);
        awardItems.push({
          type: "badge",
          title: badge.title,
          description: badge.description || "",
          criteria: badge.criteria || "",
        });
      }
    }

    if (certificateTitle && certificateTitle.trim()) {
      const resolvedCredentialId = await generateUniqueCredentialId();
      const backendBaseUrl = process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
      const frontendBaseUrl = getFrontendBaseUrl(req);
      const verificationPageUrl = `${frontendBaseUrl}/verify/${resolvedCredentialId}`;

      const certificateData = {
        title: certificateTitle.trim(),
        issuer: issuer?.trim() || "UniConnect",
        credentialId: resolvedCredentialId,
        verificationUrl: verificationUrl?.trim() || verificationPageUrl,
        certificateUrl: "",
        issuedAt: new Date(),
        issuedBy: req.user?._id,
        status: "ACTIVE",
        signature: "",
      };

      // If a certificate image was uploaded, set the URL
      if (req.file) {
        certificateData.certificateUrl = `/uploads/certificates/${req.file.filename}`;
      }

      const signaturePayload = buildCertificatePayload({
        ...certificateData,
        userId,
      });
      certificateData.signature = signCertificatePayload(
        signaturePayload,
        CREDENTIAL_SIGNING_SECRET
      );

      profile.certificates.push(certificateData);

      awardItems.push({
        type: "certificate",
        title: certificateData.title,
        issuer: certificateData.issuer,
        credentialId: certificateData.credentialId,
        verificationPageUrl,
      });
    }

    await profile.save();
    await profile.populate("badges");

    if (awardItems.length > 0) {
      try {
        const dashboardUrl = `${process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`}/dashboard`;
        const textLines = [
          `Hello ${user.fullName || "Student"},`,
          "",
          "Congratulations! You have received new achievement updates in your UniConnect account.",
          "",
          ...awardItems.map((item) => {
            if (item.type === "badge") {
              return [
                `Badge: ${item.title}`,
                item.description ? `Description: ${item.description}` : null,
                item.criteria ? `Criteria: ${item.criteria}` : null,
              ]
                .filter(Boolean)
                .join("\n");
            }

            return [
              `Certificate: ${item.title}`,
              item.issuer ? `Issuer: ${item.issuer}` : null,
              item.credentialId ? `Credential ID: ${item.credentialId}` : null,
              item.verificationPageUrl ? `Verification: ${item.verificationPageUrl}` : null,
            ]
              .filter(Boolean)
              .join("\n");
          }),
          "",
          "Open your dashboard to view the complete details.",
          "",
          "Regards,",
          "UniConnect Team",
        ].join("\n");

        await sendEmail({
          to: user.email,
          subject: "UniConnect: Your new achievement is ready",
          text: textLines,
          html: buildRewardEmailHtml({
            fullName: user.fullName,
            awardItems,
            dashboardUrl,
          }),
        });
      } catch (emailError) {
        console.error("Reward email notification failed:", {
          message: emailError?.message,
          code: emailError?.code,
          response: emailError?.response,
        });
      }
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


