import mongoose from "mongoose";

/**
 * User Schema: Defines the schema for local MongoDB User records.
 * Keeps a local sync of profiles created via Firebase Authentication.
 */
const userSchema = new mongoose.Schema(
  {
    // Unique identifier assigned by Firebase Authentication
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    // User's display name
    name: {
      type: String,
      required: true,
    },
    // Unique verified user email address
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Optional URL profile picture
    avatar: {
      type: String,
    },
  },
  { timestamps: true }, // Automatically injects createdAt and updatedAt fields
);

const User = mongoose.model("User", userSchema);

export default User;
