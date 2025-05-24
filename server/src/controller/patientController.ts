import { Request, Response } from 'express';
import Patient, { IPatient } from '../models/Patient';
import User from '../models/User';
import Vaccination from '../models/Vaccination';
import NCDRecord from '../models/NCDRecord';
import { PatientType, UserRole } from '../types/user';

// Create patient profile
export const createPatientProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // Check if profile already exists
    const existingProfile = await Patient.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Patient profile already exists',
      });
    }

    // Get user to check patient type
    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PATIENT) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user or user is not a patient',
      });
    }

    const patientData = {
      userId,
      patientType: user.patientType,
      ...req.body,
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get patient profile
export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update patient profile
export const updatePatientProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    const patient = await Patient.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get vaccinations for a child
export const getChildVaccinations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { childId } = req.params;
    
    // Verify the child belongs to this user
    const patient = await Patient.findOne({ userId });
    if (!patient || patient.patientType !== PatientType.MOTHER) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these records',
      });
    }

    const childExists = patient.children?.some(
      child => child._id.toString() === childId
    );

    if (!childExists) {
      return res.status(403).json({
        success: false,
        message: 'Child not found or not authorized',
      });
    }

    const vaccinations = await Vaccination.find({
      childId,
      motherUserId: userId,
    }).sort({ dateAdministered: -1 });

    res.status(200).json({
      success: true,
      count: vaccinations.length,
      data: vaccinations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get NCD records for a patient
export const getNCDRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // Get patient ID from user ID
    const patient = await Patient.findOne({ userId });
    if (!patient || patient.patientType !== PatientType.NCD) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized or not an NCD patient',
      });
    }

    const records = await NCDRecord.find({
      patientId: patient._id,
    }).sort({ recordDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};