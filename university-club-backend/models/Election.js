import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const electionSchema = new mongoose.Schema(
  {
    clubId: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    votes: [voteSchema],
    status: { type: String, enum: ["pending", "ongoing", "completed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Election", electionSchema);