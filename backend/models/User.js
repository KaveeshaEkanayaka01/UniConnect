import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },


    studentId: {
      
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["STUDENT", "CLUB_ADMIN", "SYSTEM_ADMIN"],
      default: "STUDENT",
    },
    faculty: {
      type: String,
      required: true,
    },
    yearOfStudy: {
      type: String,
      required: true,
    },
    skills: {
     type: [String],
     default: [],
    },
 

   isMentor: {
     type: Boolean,
     default: false,
   },

  availability: {
    type: Boolean,
    default: true,
  },



    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
