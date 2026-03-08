 import mongoose from "mongoose";

const skillDetailSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    proficiency: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    relatedActivity: {
      type: String,
      default: "",
      trim: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    universityId: String,

    degreeProgram: String,

    faculty: String,

    yearOfStudy: Number,

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    skillDetails: [skillDetailSchema],

    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("StudentProfile", studentProfileSchema);