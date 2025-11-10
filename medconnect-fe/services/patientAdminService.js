import api from './api';

const patientAdminService = {
  /**
   * Get all patients
   */
  getAllPatients: async (token) => {
    const response = await api.get('/admin/patients', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id, token) => {
    const response = await api.get(`/admin/patients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Update patient
   */
  updatePatient: async (id, data, token) => {
    const response = await api.put(`/admin/patients/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Delete patient
   */
  deletePatient: async (id, token) => {
    const response = await api.delete(`/admin/patients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default patientAdminService;
