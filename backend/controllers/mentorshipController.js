import MentorProfile from "../models/MentorProfile.js";
import MentorshipRequest from "../models/MentorshipRequest.js";
import Club from "../models/Club.js";

const normalizeArray = (arr = []) =>
  [...new Set(arr.map((item) => String(item).trim().toLowerCase()).filter(Boolean))];

const levelMap = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

const calculateMatchScore = (studentData, mentorProfile) => {
  const studentSkills = normalizeArray(studentData.studentSkills || []);
  const studentInterests = normalizeArray(studentData.studentInterests || []);
  const mentorSkills = normalizeArray(mentorProfile.skills || []);
  const mentorInterests = normalizeArray(mentorProfile.interests || []);

  const commonSkills = studentSkills.filter((skill) =>
    mentorSkills.includes(skill)
  ).length;

  const commonInterests = studentInterests.filter((interest) =>
    mentorInterests.includes(interest)
  ).length;

  const skillScore =
    studentSkills.length > 0 ? commonSkills / studentSkills.length : 0;

  const interestScore =
    studentInterests.length > 0 ? commonInterests / studentInterests.length : 0;

  const studentLevelValue = levelMap[studentData.studentLevel] || 1;
  const mentorLevelValue = levelMap[mentorProfile.expertiseLevel] || 2;

  let levelScore = 0;
  if (mentorLevelValue >= studentLevelValue) {
    levelScore = 1;
  } else if (mentorLevelValue + 1 === studentLevelValue) {
    levelScore = 0.5;
  }

  const capacityScore =
    mentorProfile.currentMentees < mentorProfile.maxMentees ? 1 : 0;

  const availabilityScore =
    mentorProfile.availability === "Available"
      ? 1
      : mentorProfile.availability === "Busy"
      ? 0.5
      : 0;

  const finalScore =
    skillScore * 0.4 +
    interestScore * 0.25 +
    levelScore * 0.15 +
    capacityScore * 0.1 +
    availabilityScore * 0.1;

  return Number(finalScore.toFixed(2));
};

// Create mentor profile
export const createMentorProfile = async (req, res) => {
  try {
    const { clubId } = req.params;
    const {
      title,
      bio,
      skills,
      interests,
      expertiseLevel,
      availability,
      maxMentees,
    } = req.body;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const existing = await MentorProfile.findOne({
      club: clubId,
      mentor: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a mentor profile in this club",
      });
    }

    const mentorProfile = await MentorProfile.create({
      club: clubId,
      mentor: req.user._id,
      title: title || "",
      bio: bio || "",
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : [],
      expertiseLevel: expertiseLevel || "Intermediate",
      availability: availability || "Available",
      maxMentees: maxMentees || 5,
    });

    const populated = await MentorProfile.findById(mentorProfile._id)
      .populate("mentor", "name email profilePicture role")
      .populate("club", "name");

    return res.status(201).json(populated);
  } catch (error) {
    console.error("createMentorProfile error:", error);
    return res.status(500).json({ message: "Failed to create mentor profile" });
  }
};

// Get all mentors in a club
export const getClubMentors = async (req, res) => {
  try {
    const { clubId } = req.params;

    const mentors = await MentorProfile.find({
      club: clubId,
      isActive: true,
    })
      .populate("mentor", "name email profilePicture role")
      .sort({ createdAt: -1 });

    return res.status(200).json(mentors);
  } catch (error) {
    console.error("getClubMentors error:", error);
    return res.status(500).json({ message: "Failed to fetch mentors" });
  }
};

// ML-style mentor recommendations
export const getRecommendedMentors = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { studentSkills, studentInterests, studentLevel } = req.body;

    const mentors = await MentorProfile.find({
      club: clubId,
      isActive: true,
    }).populate("mentor", "name email profilePicture role");

    const ranked = mentors
      .map((mentorProfile) => ({
        ...mentorProfile.toObject(),
        matchScore: calculateMatchScore(
          {
            studentSkills,
            studentInterests,
            studentLevel,
          },
          mentorProfile
        ),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json(ranked);
  } catch (error) {
    console.error("getRecommendedMentors error:", error);
    return res.status(500).json({ message: "Failed to generate recommendations" });
  }
};

// Create mentorship request
export const createMentorshipRequest = async (req, res) => {
  try {
    const { clubId } = req.params;
    const {
      mentorId,
      message,
      studentSkills,
      studentInterests,
      studentLevel,
    } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: "Mentor is required" });
    }

    const mentorProfile = await MentorProfile.findOne({
      club: clubId,
      mentor: mentorId,
      isActive: true,
    });

    if (!mentorProfile) {
      return res.status(404).json({ message: "Mentor profile not found" });
    }

    if (String(req.user._id) === String(mentorId)) {
      return res.status(400).json({ message: "You cannot request yourself" });
    }

    const existingPending = await MentorshipRequest.findOne({
      club: clubId,
      student: req.user._id,
      mentor: mentorId,
      status: "PENDING",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending request for this mentor",
      });
    }

    const matchScore = calculateMatchScore(
      { studentSkills, studentInterests, studentLevel },
      mentorProfile
    );

    const request = await MentorshipRequest.create({
      club: clubId,
      student: req.user._id,
      mentor: mentorId,
      message: message || "",
      studentSkills: Array.isArray(studentSkills) ? studentSkills : [],
      studentInterests: Array.isArray(studentInterests) ? studentInterests : [],
      studentLevel: studentLevel || "Beginner",
      matchScore,
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate("student", "name email profilePicture")
      .populate("mentor", "name email profilePicture")
      .populate("club", "name");

    return res.status(201).json(populated);
  } catch (error) {
    console.error("createMentorshipRequest error:", error);
    return res.status(500).json({ message: "Failed to create mentorship request" });
  }
};

// Student's requests
export const getMyMentorshipRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({
      student: req.user._id,
    })
      .populate("student", "name email profilePicture")
      .populate("mentor", "name email profilePicture")
      .populate("club", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("getMyMentorshipRequests error:", error);
    return res.status(500).json({ message: "Failed to fetch your requests" });
  }
};

// Requests received by mentor
export const getMentorRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({
      mentor: req.user._id,
    })
      .populate("student", "name email profilePicture")
      .populate("mentor", "name email profilePicture")
      .populate("club", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("getMentorRequests error:", error);
    return res.status(500).json({ message: "Failed to fetch mentor requests" });
  }
};

// Accept or reject request
export const updateMentorshipRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await MentorshipRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const isMentor = String(request.mentor) === String(req.user._id);
    const isStudent = String(request.student) === String(req.user._id);

    if (!isMentor && !isStudent) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "ACCEPTED" && isMentor) {
      const mentorProfile = await MentorProfile.findOne({
        club: request.club,
        mentor: request.mentor,
      });

      if (!mentorProfile) {
        return res.status(404).json({ message: "Mentor profile not found" });
      }

      if (mentorProfile.currentMentees >= mentorProfile.maxMentees) {
        return res.status(400).json({ message: "Mentor has reached max mentees" });
      }

      mentorProfile.currentMentees += 1;
      await mentorProfile.save();
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    const populated = await MentorshipRequest.findById(request._id)
      .populate("student", "name email profilePicture")
      .populate("mentor", "name email profilePicture")
      .populate("club", "name");

    return res.status(200).json(populated);
  } catch (error) {
    console.error("updateMentorshipRequestStatus error:", error);
    return res.status(500).json({ message: "Failed to update request status" });
  }
};