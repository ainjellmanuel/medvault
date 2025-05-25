import mongoose, { Schema, Document } from "mongoose";
import { NCDType } from "../types";

const NCDPatientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    medicalHistory: {
      ncdTypes: [{ type: String, enum: Object.values(NCDType) }],
      diagnosisDate: { type: Date, required: true },
      medications: [{ type: String }],
      allergies: [{ type: String }],
      familyHistory: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export const NCDPatient = mongoose.model("NCDPatient", NCDPatientSchema);
