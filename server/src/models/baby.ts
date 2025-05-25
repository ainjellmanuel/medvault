import mongoose, { Schema, Document } from "mongoose";

const BabySchema = new Schema(
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

export const Baby = mongoose.model("Baby", BabySchema);
