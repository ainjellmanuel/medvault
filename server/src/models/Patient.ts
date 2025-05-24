import mongoose, { Document, Schema } from 'mongoose';
import { PatientType } from '../types/user';

export interface IChildInfo {
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
}

export interface IPatient extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  patientType: PatientType;
  birthDate: Date;
  gender: string;
  contactNumber: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    contactNumber: string;
  };
  // For mothers
  children?: IChildInfo[];
  // For NCD patients
  ncdType?: string;
  medications?: string[];
  allergies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    patientType: {
      type: String,
      enum: Object.values(PatientType),
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    emergencyContact: {
      name: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
    },
    // For mothers
    children: [
      {
        name: {
          type: String,
          required: function() {
            return (this as any).patientType === PatientType.MOTHER;
          },
        },
        birthDate: {
          type: Date,
          required: function() {
            return (this as any).patientType === PatientType.MOTHER;
          },
        },
        gender: {
          type: String,
          enum: ['male', 'female', 'other'],
          required: function() {
            return (this as any).patientType === PatientType.MOTHER;
          },
        },
      },
    ],
    // For NCD patients
    ncdType: {
      type: String,
      required: function() {
        return (this as any).patientType === PatientType.NCD;
      },
    },
    medications: [String],
    allergies: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);