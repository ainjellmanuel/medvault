import mongoose, { Schema, Document } from "mongoose";
import { IVaccination, VaccineType } from "../types";

interface VaccinationDocument extends IVaccination, Document {}

const VaccinationSchema = new Schema<VaccinationDocument>(
  {
    babyId: { type: Schema.Types.ObjectId, ref: "Baby", required: true },
    vaccineType: { type: String, enum: Object.values(VaccineType), required: true },
    dateAdministered: { type: Date, required: true },
    nextDueDate: { type: Date },
    batchNumber: { type: String },
    administeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Vaccination = mongoose.model<VaccinationDocument>("Vaccination", VaccinationSchema);
