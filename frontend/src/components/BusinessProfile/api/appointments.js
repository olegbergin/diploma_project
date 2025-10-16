// src/components/BusinessProfile/api/appointments.js
import axiosInstance from '../../../utils/axiosInstance';

export async function fetchAppointments(businessId, monthIso) {
  const response = await axiosInstance.get('/appointments', {
    params: {
      businessId,
      month: monthIso
    }
  });
  return response.data; // [{ date:"YYYY-MM-DD", time:"HH:MM", ... }]
}
