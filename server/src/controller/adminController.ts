import { Request, Response } from 'express';
import User from '../models/User';
import Patient from '../models/Patient';
import Vaccination from '../models/Vaccination';
import NCDRecord from '../models/NCDRecord';
import { UserRole, PatientType } from '../types/user';

// Get all patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    // Query parameters for filtering
    const { patientType } = req.query;
    
    let query: any = {};
    
    if (patientType) {
      query.patientType = patientType;
    }
    
    const patients = await Patient.find(query);
    
    // Get user details for each patient
    const patientDetails = await Promise.all(
      patients.map(async (patient) => {
        const user = await User.findById(patient.userId);
        return {
          ...patient.toObject(),
          userName: user?.name,
          userEmail: user?.email,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientDetails.length,
      data: patientDetails,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get single patient details
export const getPatientDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }
    
    const user = await User.findById(patient.userId);
    
    res.status(200).json({
      success: true,
      data: {
        ...patient.toObject(),
        userName: user?.name,
        userEmail: user?.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Add vaccination record
export const addVaccinationRecord = async (req: Request, res: Response) => {
  try {
    const { childId, motherUserId, vaccineName, doseNumber, dateAdministered, nextScheduledDate, notes } = req.body;
    
    // Verify the child exists and belongs to the mother
    const motherPatient = await Patient.findOne({ 
      userId: motherUserId,
      patientType: PatientType.MOTHER
    });
    
    if (!motherPatient) {
      return res.status(400).json({
        success: false,
        message: 'Mother patient record not found',
      });
    }
    
    const childExists = motherPatient.children?.some(
      child => child._id.toString() === childId
    );
    
    if (!childExists) {
      return res.status(400).json({
        success: false,
        message: 'Child not found for this mother',
      });
    }
    
    const vaccination = await Vaccination.create({
      childId,
      motherUserId,
      vaccineName,
      doseNumber,
      dateAdministered,
      administeredBy: req.user?.name,
      nextScheduledDate,
      notes,
    });
    
    res.status(201).json({
      success: true,
      data: vaccination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Add NCD record
export const addNCDRecord = async (req: Request, res: Response) => {
  try {
    const { patientId, bloodPressure, bloodSugar, weight, symptoms, medications, notes, nextAppointment } = req.body;
    
    // Verify patient exists and is an NCD patient
    const patient = await Patient.findById(patientId);
    if (!patient || patient.patientType !== PatientType.NCD) {
      return res.status(400).json({
        success: false,
        message: 'NCD patient not found',
      });
    }
    
    const record = await NCDRecord.create({
      patientId,
      recordDate: new Date(),
      bloodPressure,
      bloodSugar,
      weight,
      symptoms,
      medications,
      notes,
      nextAppointment,
      createdBy: req.user?._id,
    });
    
    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get a list of all NCD records for a specific patient (for admin view)
export const getPatientNCDRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient || patient.patientType !== PatientType.NCD) {
      return res.status(404).json({
        success: false,
        message: 'NCD patient not found',
      });
    }
    
    const records = await NCDRecord.find({ patientId })
      .sort({ recordDate: -1 });
      
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

// Get all vaccinations for a child (for admin view)
export const getChildVaccinationRecords = async (req: Request, res: Response) => {
  try {
    const { childId } = req.params;
    
    const vaccinations = await Vaccination.find({ childId })
      .sort({ dateAdministered: -1 });
      
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