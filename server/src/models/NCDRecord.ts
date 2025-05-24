import mongoose, { Document, Schema } from 'mongoose';

export interface INCDRecord extends Document {
  patientId: mongoose.Schema.Types.ObjectId;
  recordDate: Date;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bloodSugar?: number;
  weight?: number;
  symptoms?: string[];
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  notes?: string;
  nextAppointment?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NCDRecordSchema = new Schema<INCDRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    recordDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: 0,
      },
      diastolic: {
        type: Number,
        min: 0,
      },
    },
    bloodSugar: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    symptoms: [String],
    medications: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
      },
    ],
    notes: {
      type: String,
    },
    nextAppointment: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model<INCDRecord>('NCDRecord', NCDRecordSchema);