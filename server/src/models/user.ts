import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String },
    facilityName: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", UserSchema);
