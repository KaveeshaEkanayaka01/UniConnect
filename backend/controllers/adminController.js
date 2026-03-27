import bcrypt from "bcryptjs";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import Badge from "../models/Badge.js";
import sendEmail from "../utils/sendEmail.js";

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
    const { badgeId, certificateTitle, issuer, credentialId, verificationUrl } = req.body;

    const user = await User.findById(userId).select("fullName email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const notificationLines = [];

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
        notificationLines.push(
          `- New badge awarded: ${badge.title}`,
          badge.description ? `  Description: ${badge.description}` : null,
          badge.criteria ? `  Criteria: ${badge.criteria}` : null
        );
      }
    }

    if (certificateTitle && certificateTitle.trim()) {
      const certificateData = {
        title: certificateTitle.trim(),
        issuer: issuer?.trim() || "UniConnect",
        credentialId: credentialId?.trim() || "",
        verificationUrl: verificationUrl?.trim() || "",
        certificateUrl: "",
        issuedAt: new Date(),
      };

      // If a certificate image was uploaded, set the URL
      if (req.file) {
        certificateData.certificateUrl = `/uploads/certificates/${req.file.filename}`;
      }

      profile.certificates.push(certificateData);

      notificationLines.push(
        `- New certificate issued: ${certificateData.title}`,
        `  Issuer: ${certificateData.issuer}`,
        certificateData.credentialId
          ? `  Credential ID: ${certificateData.credentialId}`
          : null,
        certificateData.verificationUrl
          ? `  Verification URL: ${certificateData.verificationUrl}`
          : null
      );
    }

    await profile.save();
    await profile.populate("badges");

    const emailLines = notificationLines.filter(Boolean);
    if (emailLines.length > 0) {
      try {
        await sendEmail({
          to: user.email,
          subject: "UniConnect Reward Update",
          text: [
            `Hello ${user.fullName || "Student"},`,
            "",
            "You have received new achievement updates in your UniConnect account:",
            "",
            ...emailLines,
            "",
            "Please log in to your dashboard to view full details.",
            "",
            "Regards,",
            "UniConnect Team",
          ].join("\n"),
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
