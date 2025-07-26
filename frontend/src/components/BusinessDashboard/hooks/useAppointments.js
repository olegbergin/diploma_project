import { useState, useEffect, useCallback } from 'react';
import axios from '../../../config/axios';

export function useAppointments(businessId) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate mock appointments for development
  const generateMockAppointments = useCallback(() => {
    const today = new Date();
    const mockAppointments = [];

    // Generate appointments for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Random number of appointments per day (0-5)
      const appointmentsCount = Math.floor(Math.random() * 6);
      
      for (let j = 0; j < appointmentsCount; j++) {
        const hour = 9 + Math.floor(Math.random() * 9); // 9:00-17:00
        const minute = Math.random() > 0.5 ? 0 : 30; // :00 or :30
        
        const appointmentDate = new Date(date);
        appointmentDate.setHours(hour, minute, 0, 0);
        
        const statuses = ['confirmed', 'pending', 'completed', 'cancelled'];
        const services = ['חלה לשבת', 'עוגיות', 'לחם מחמצת', 'קרואסונים', 'עוגה מיוחדת'];
        const customers = ['רחל כהן', 'דוד לוי', 'מיכל דהן', 'אברהם מזרחי', 'שרה גבריאל'];
        
        mockAppointments.push({
          id: `apt_${i}_${j}`,
          businessId,
          customerId: `customer_${Math.floor(Math.random() * 100)}`,
          customerName: customers[Math.floor(Math.random() * customers.length)],
          customerPhone: `05${Math.floor(Math.random() * 90000000) + 10000000}`,
          serviceId: `service_${j % services.length}`,
          serviceName: services[j % services.length],
          date: appointmentDate.toISOString().split('T')[0],
          time: appointmentDate.toTimeString().split(' ')[0].slice(0, 5),
          duration: 30 + Math.floor(Math.random() * 60), // 30-90 minutes
          status: statuses[Math.floor(Math.random() * statuses.length)],
          price: 50 + Math.floor(Math.random() * 200), // ₪50-250
          notes: Math.random() > 0.7 ? 'הערות מיוחדות מהלקוח' : '',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return mockAppointments.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
  }, [businessId]);

  // Load appointments
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current month in YYYY-MM format for API call
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Fetch appointments from API
      const response = await axios.get(`/api/appointments`, {
        params: {
          businessId: businessId,
          month: currentMonth
        }
      });
      
      // Transform API data to match expected structure
      const transformedAppointments = response.data.map(apt => ({
        id: apt.appointment_id,
        businessId: businessId,
        customerId: apt.customer_id,
        customerName: `${apt.first_name || 'לקוח'} ${apt.last_name || ''}`.trim(),
        customerPhone: apt.phone || '',
        serviceId: apt.service_id,
        serviceName: apt.service_name || 'שירות',
        date: apt.date,
        time: apt.time,
        duration: apt.duration_minutes || 60,
        status: apt.status,
        price: apt.price || 0,
        notes: apt.notes || '',
        createdAt: apt.appointment_datetime,
        updatedAt: apt.appointment_datetime
      }));

      setAppointments(transformedAppointments);

    } catch (err) {
      setError('שגיאה בטעינת התורים. אנא נסה שוב.');
      console.error('Failed to load appointments:', err);
      
      // Fallback to mock data if API fails
      const mockData = generateMockAppointments();
      setAppointments(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, generateMockAppointments]);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData) => {
    try {
      // In production:
      // const response = await fetch(`/api/businesses/${businessId}/appointments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointmentData)
      // });
      // if (!response.ok) throw new Error('Failed to create appointment');
      // const newAppointment = await response.json();

      // Mock implementation
      const newAppointment = {
        id: `apt_new_${Date.now()}`,
        businessId,
        ...appointmentData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAppointments(prev => [...prev, newAppointment].sort((a, b) => 
        new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
      ));

      return newAppointment;
    } catch (err) {
      console.error('Failed to create appointment:', err);
      throw new Error('שגיאה ביצירת התור');
    }
  }, [businessId]);

  // Update appointment
  const updateAppointment = useCallback(async (appointmentId, updates) => {
    try {
      // In production:
      // const response = await fetch(`/api/appointments/${appointmentId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update appointment');
      // const updatedAppointment = await response.json();

      // Mock implementation
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      ));

    } catch (err) {
      console.error('Failed to update appointment:', err);
      throw new Error('שגיאה בעדכון התור');
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback(async (appointmentId) => {
    try {
      // In production:
      // const response = await fetch(`/api/appointments/${appointmentId}`, {
      //   method: 'DELETE'
      // });
      // if (!response.ok) throw new Error('Failed to delete appointment');

      // Mock implementation
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));

    } catch (err) {
      console.error('Failed to delete appointment:', err);
      throw new Error('שגיאה במחיקת התור');
    }
  }, []);

  // Refresh appointments
  const refreshAppointments = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Load appointments on mount and when businessId changes
  useEffect(() => {
    if (businessId) {
      loadAppointments();
    }
  }, [businessId, loadAppointments]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (businessId && !isLoading) {
        loadAppointments();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [businessId, isLoading, loadAppointments]);

  return {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments
  };
}