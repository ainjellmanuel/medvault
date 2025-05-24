import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../types/user';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Create a new user (by superadmin)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, patientType } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
    
    // Validate role and patientType combinations
    if (role === UserRole.PATIENT && !patientType) {
      return res.status(400).json({
        success: false,
        message: 'Patient type is required for patient role',
      });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      patientType: role === UserRole.PATIENT ? patientType : undefined,
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientType: user.patientType,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update user (by superadmin)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, patientType } = req.body;
    
    // Validate role and patientType combinations
    if (role === UserRole.PATIENT && !patientType) {
      return res.status(400).json({
        success: false,
        message: 'Patient type is required for patient role',
      });
    }
    
    const updateData: any = {
      name,
      email,
      role,
    };
    
    if (role === UserRole.PATIENT) {
      updateData.patientType = patientType;
    }
    
    const user = await User.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete user (by superadmin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Also delete patient profile if exists
    await Patient.findOneAndDelete({ userId: id });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};