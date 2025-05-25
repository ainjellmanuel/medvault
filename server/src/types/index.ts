import { Types } from "mongoose";

export enum UserRole {
  HEALTHCARE_PROVIDER = "healthcare_provider",
  PARENT = "parent",
  NCD_PATIENT = "ncd_patient",
}

export enum VaccineType {
  BCG = "BCG",
  HEPATITIS_B = "Hepatitis B",
  DPT = "DPT",
  POLIO = "Polio",
  MMR = "MMR",
  VARICELLA = "Varicella",
}

export enum NCDType {
  DIABETES = "diabetes",
  HYPERTENSION = "hypertension",
  HEART_DISEASE = "heart_disease",
  KIDNEY_DISEASE = "kidney_disease",
  CANCER = "cancer",
}

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  facilityName?: string; // For healthcare providers
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBaby {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "male" | "female";
  parentId: Types.ObjectId | string;
  birthWeight?: number;
  birthHeight?: number;
  bloodType?: string;
  allergies?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVaccination {
  babyId: Types.ObjectId | string;
  vaccineType: VaccineType;
  dateAdministered: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  administeredBy: Types.ObjectId | string; // Healthcare provider ID
  notes?: string;
  createdAt?: Date;
}

export interface INCDPatient {
  userId: Types.ObjectId | string;
  dateOfBirth: Date;
  gender: "male" | "female";
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory: {
    ncdTypes: NCDType[];
    diagnosisDate: Date;
    medications: string[];
    allergies: string[];
    familyHistory: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMedicalRecord {
  patientId: Types.ObjectId | string;
  recordDate: Date;
  recordType: "consultation" | "lab_result" | "prescription" | "follow_up";
  title: string;
  description: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    bloodSugar?: number;
  };
  attachments?: string[];
  providerId: Types.ObjectId | string;
  createdAt?: Date;
}
