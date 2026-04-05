import mongoose from "mongoose";

const mentorshipRequestSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    studentSkills: {
      type: [String],
      default: [],
    },
    studentInterests: {
      type: [String],
      default: [],
    },
    studentLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

mentorshipRequestSchema.index(
  { club: 1, student: 1, mentor: 1, status: 1 },
  { unique: false }
);

export default mongoose.model("MentorshipRequest", mentorshipRequestSchema);