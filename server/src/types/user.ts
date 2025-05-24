import { Types } from "mongoose";

export enum UserRole {
  PATIENT = 'patient',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export enum PatientType {
  MOTHER = 'mother',
  NCD = 'ncd'
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  patientType?: PatientType;
  createdAt: Date;
  updatedAt: Date;
}
