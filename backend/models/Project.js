import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    description: String,

    images: {
      type: [String],
      validate: [(arr) => arr.length <= 3, "Max 3 images allowed"],
      default: []
    },

    category: String,

    clubName: String,

    projectDate: Date,

    status: {
      type: String,
      enum: ["Completed", "Ongoing", "Planned"],
      default: "Ongoing",
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);