import mongoose, { Document, Schema } from 'mongoose';

export interface IVaccination extends Document {
  childId: mongoose.Schema.Types.ObjectId;
  motherUserId: mongoose.Schema.Types.ObjectId;
  vaccineName: string;
  doseNumber: number;
  dateAdministered: Date;
  administeredBy: string;
  nextScheduledDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VaccinationSchema = new Schema<IVaccination>(
  {
    childId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    motherUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    vaccineName: {
      type: String,
      required: true,
    },
    doseNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    dateAdministered: {
      type: Date,
      required: true,
    },
    administeredBy: {
      type: String,
      required: true,
    },
    nextScheduledDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVaccination>('Vaccination', VaccinationSchema);