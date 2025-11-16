// Centralized API configuration and helper functions

// Use centralized API utility
import { getApiUrl } from '../utils/api';

const API_BASE_URL = getApiUrl();

/**
 * Helper to make authenticated API calls
 */
export async function apiCall(endpoint, options = {}, user = null) {
  const token = user ? await user.getIdToken() : null;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || errorData.error || 'API call failed');
  }

  return response.json();
}

// Admin Management APIs
export const adminAPI = {
  // Get all admins
  getAllAdmins: (user) => apiCall('/admin/users', {}, user),
  
  // Get admin by ID
  getAdminById: (id, user) => apiCall(`/admin/users/${id}`, {}, user),
  
  // Create admin
  createAdmin: (data, user) => apiCall('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }, user),
  
  // Update admin
  updateAdmin: (id, data, user) => apiCall(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, user),
  
  // Delete admin
  deleteAdmin: (id, user) => apiCall(`/admin/users/${id}`, {
    method: 'DELETE',
  }, user),
  
  // Toggle admin status (lock/unlock)
  toggleAdminStatus: (id, disabled, user) => apiCall(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ disabled }),
  }, user),
  
  // Change admin password
  changeAdminPassword: (id, newPassword, user) => apiCall(`/admin/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  }, user),
};

// Doctor Management APIs
export const doctorAPI = {
  // Get all doctors
  getAllDoctors: (user) => apiCall('/admin/doctor/all', {}, user),
  
  // Create doctor
  createDoctor: (data, user) => apiCall('/admin', {
    method: 'POST',
    body: JSON.stringify(data),
  }, user),
  
  // Update doctor
  updateDoctor: (id, data, user) => apiCall(`/admin/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, user),
  
  // Delete doctor
  deleteDoctor: (id, user) => apiCall(`/admin/doctor/${id}`, {
    method: 'DELETE',
  }, user),
  
  // Get all specialties
  getAllSpecialties: (user) => apiCall('/admin/speciality/all', {}, user),
};

export const patientAPI = {
  // Get my profile
  getMyProfile: (user) => apiCall('/patient/profile', {}, user),

  // Update my profile
  updateMyProfile: (data, user) =>
    apiCall('/patient/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, user),
};

// Admin APIs for managing patients
export const adminPatientAPI = {
  getAllPatients: (user) => apiCall('/patient/all', {}, user),

  getPatientById: (id, user) => apiCall(`/patient/${id}`, {}, user),

  updatePatient: (id, data, user) => apiCall(`/patient/update`, {
    method: 'POST', // vì backend dùng POST cho update
    body: JSON.stringify(data),
  }, user),

  createPatient: (data, user) => apiCall('/patient/update', {
    method: 'POST',
    body: JSON.stringify(data),
  }, user),

  deletePatient: (id, user) => apiCall(`/patient/${id}`, { 
    method: 'DELETE'
  }, user),
};


// Export individual endpoints for backward compatibility
export const API_ENDPOINTS = {
  // Admin
  GET_ADMINS: '/admin/users',
  GET_ADMIN_BY_ID: (id) => `/admin/users/${id}`,
  CREATE_ADMIN: '/admin/users',
  UPDATE_ADMIN: (id) => `/admin/users/${id}`,
  DELETE_ADMIN: (id) => `/admin/users/${id}`,
  TOGGLE_ADMIN_STATUS: (id) => `/admin/users/${id}/status`,
  CHANGE_ADMIN_PASSWORD: (id) => `/admin/users/${id}/password`,
  
  // Doctor
  GET_DOCTORS: '/admin/doctor/all',
  CREATE_DOCTOR: '/admin',
  UPDATE_DOCTOR: (id) => `/admin/${id}`,
  DELETE_DOCTOR: (id) => `/admin/doctor/${id}`,
  GET_SPECIALTIES: '/admin/speciality/all',
};

export { API_BASE_URL };
