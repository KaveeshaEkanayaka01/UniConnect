import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiptVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const rolesSchema = new mongoose.Schema({
  president: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  treasurer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  secretary: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    constitution: { type: String }, // can store file path or text
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roles: rolesSchema,
    budget: {
      total: { type: Number, default: 0 },
      expenses: [expenseSchema],
    },
    events: [eventSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);