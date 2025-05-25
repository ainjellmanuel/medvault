import mongoose, { Schema, Document } from "mongoose";
import { IBaby } from "../types";

interface BabyDocument extends IBaby, Document {}

const BabySchema = new Schema<BabyDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    birthWeight: { type: Number },
    birthHeight: { type: Number },
    bloodType: { type: String },
    allergies: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Baby = mongoose.model<BabyDocument>("Baby", BabySchema);
