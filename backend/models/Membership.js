import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    required: true
  },
  role: {
    type: String,
    enum: [
      "president", "vice_president", "treasurer", "secretary", "event_coordinator",
      "marketing_chair", "social_media_manager", "fundraising_chair", "public_relations_chair",
      "volunteer_coordinator", "alumni_relations_chair", "club_admin", "member"
    ],
    default: "member"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Membership", membershipSchema);