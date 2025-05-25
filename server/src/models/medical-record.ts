import mongoose, { Schema, Document } from "mongoose";

const MedicalRecordSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "NCDPatient", required: true },
    recordDate: { type: Date, required: true },
    recordType: {
      type: String,
      enum: ["consultation", "lab_result", "prescription", "follow_up"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    vitals: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      weight: { type: Number },
      height: { type: Number },
      bloodSugar: { type: Number },
    },
    attachments: [{ type: String }],
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const MedicalRecord = mongoose.model("MedicalRecord", MedicalRecordSchema);
