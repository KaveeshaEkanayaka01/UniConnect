import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  date: Date,
  topic: String,
  notes: String,
  duration: Number
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "rejected"],
      default: "pending"
    },

    goals: [String],
    expertise: [String],

    startDate: Date,
    endDate: Date,

    meetings: [meetingSchema],
    feedback: feedbackSchema,

    matchScore: { type: Number, min: 0, max: 100 }
  },
  { timestamps: true }
);

export default mongoose.model("Mentorship", mentorshipSchema);