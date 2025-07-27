import { useState, useEffect, useCallback } from 'react';
import axios from '../../../config/axios';

export function useServices(businessId) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load services from API
  const loadServices = useCallback(async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/businesses/${businessId}/services`);
      const apiServices = response.data;
      
      // Transform API data to match component expectations
      const transformedServices = apiServices.map(service => ({
        id: service.service_id,
        businessId: service.business_id,
        name: service.name,
        description: service.description,
        category: 'Services', // Default category
        price: parseFloat(service.price),
        duration: service.duration_minutes,
        isActive: true,
        imageUrl: '',
        bookingsCount: 0,
        createdAt: service.created_at,
        updatedAt: service.created_at
      }));
      
      setServices(transformedServices);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(transformedServices.map(s => s.category))];
      setCategories(uniqueCategories);
      
    } catch (err) {
      setError('Failed to load services');
      console.error('Error loading services:', err);
      // Fallback to empty services array
      setServices([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Generate mock services for development (fallback)
  const generateMockServices = useCallback(() => {
    const mockCategories = ['מאפיה', 'עוגות', 'לחמים מיוחדים', 'חגים'];
    
    const mockServices = [
      {
        id: 'service_1',
        businessId,
        name: 'חלה לשבת',
        description: 'חלה טרייה ומתוקה לכבוד שבת, זמינה בגדלים שונים',
        category: 'מאפיה',
        price: 25,
        duration: 30,
        isActive: true,
        imageUrl: '',
        bookingsCount: 45,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'service_2',
        businessId,
        name: 'עוגיות חמאה',
        description: 'עוגיות חמאה פריכות וטעימות, אידיאליות לקפה',
        category: 'עוגות',
        price: 35,
        duration: 45,
        isActive: true,
        imageUrl: '',
        bookingsCount: 32,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'service_3',
        businessId,
        name: 'לחם מחמצת',
        description: 'לחם מחמצת בריא ופריך, אפוי בתנור עץ',
        category: 'לחמים מיוחדים',
        price: 45,
        duration: 60,
        isActive: true,
        imageUrl: '',
        bookingsCount: 28,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'service_4',
        businessId,
        name: 'קרואסונים',
        description: 'קרואסונים חמאתיים עם מילוי לבחירה',
        category: 'מאפיה',
        price: 15,
        duration: 20,
        isActive: true,
        imageUrl: '',
        bookingsCount: 21,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'service_5',
        businessId,
        name: 'עוגת יום הולדת',
        description: 'עוגה מותאמת אישית לימי הולדת וחגיגות',
        category: 'עוגות',
        price: 120,
        duration: 120,
        isActive: true,
        imageUrl: '',
        bookingsCount: 15,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      },
      {
        id: 'service_6',
        businessId,
        name: 'מצות בעבודת יד',
        description: 'מצות שמורות לפסח, אפויות במסורת העתיקה',
        category: 'חגים',
        price: 80,
        duration: 90,
        isActive: false,
        imageUrl: '',
        bookingsCount: 8,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z'
      }
    ];

    return { services: mockServices, categories: mockCategories };
  }, [businessId]);


  // Create service
  const createService = useCallback(async (serviceData) => {
    try {
      const response = await axios.post(`/businesses/${businessId}/services`, {
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration_minutes: serviceData.duration
      });

      const newService = {
        id: response.data.service_id,
        businessId,
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category || 'Services',
        price: serviceData.price,
        duration: serviceData.duration,
        isActive: true,
        imageUrl: '',
        bookingsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setServices(prev => [...prev, newService]);

      // Add new category if it doesn't exist
      if (serviceData.category && !categories.includes(serviceData.category)) {
        setCategories(prev => [...prev, serviceData.category]);
      }

      return newService;
    } catch (err) {
      console.error('Failed to create service:', err);
      throw new Error('שגיאה ביצירת השירות');
    }
  }, [businessId, categories]);

  // Update service
  const updateService = useCallback(async (serviceId, updates) => {
    try {
      const response = await axios.put(`/businesses/${businessId}/services/${serviceId}`, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        duration_minutes: updates.duration
      });

      const updatedService = {
        id: response.data.service_id,
        businessId,
        name: updates.name,
        description: updates.description,
        category: updates.category || 'Services',
        price: updates.price,
        duration: updates.duration,
        isActive: updates.isActive !== undefined ? updates.isActive : true,
        imageUrl: updates.imageUrl || '',
        bookingsCount: 0,
        updatedAt: new Date().toISOString()
      };

      setServices(prev => prev.map(service => 
        service.id === serviceId ? updatedService : service
      ));

      // Add new category if it doesn't exist
      if (updates.category && !categories.includes(updates.category)) {
        setCategories(prev => [...prev, updates.category]);
      }

    } catch (err) {
      console.error('Failed to update service:', err);
      throw new Error('שגיאה בעדכון השירות');
    }
  }, [businessId, categories]);

  // Delete service
  const deleteService = useCallback(async (serviceId) => {
    try {
      await axios.delete(`/businesses/${businessId}/services/${serviceId}`);

      setServices(prev => prev.filter(service => service.id !== serviceId));

    } catch (err) {
      console.error('Failed to delete service:', err);
      if (err.response?.status === 400) {
        throw new Error('לא ניתן למחוק שירות עם תורים קיימים');
      }
      throw new Error('שגיאה במחיקת השירות');
    }
  }, [businessId]);

  // Refresh services
  const refreshServices = useCallback(() => {
    loadServices();
  }, [loadServices]);

  // Load services on mount and when businessId changes
  useEffect(() => {
    if (businessId) {
      loadServices();
    }
  }, [businessId, loadServices]);

  return {
    services,
    categories,
    isLoading,
    error,
    createService,
    updateService,
    deleteService,
    refreshServices
  };
}