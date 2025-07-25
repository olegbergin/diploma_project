import { useState, useEffect, useCallback } from 'react';

export function useServices(businessId) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate mock services for development
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

  // Load services
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // In production, this would be:
      // const response = await fetch(`/api/businesses/${businessId}/services`);
      // if (!response.ok) throw new Error('Failed to load services');
      // const data = await response.json();
      // setServices(data.services);
      // setCategories(data.categories);

      // For now, use mock data
      const { services: mockServices, categories: mockCategories } = generateMockServices();
      setServices(mockServices);
      setCategories(mockCategories);

    } catch (err) {
      setError('שגיאה בטעינת השירותים. אנא נסה שוב.');
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, generateMockServices]);

  // Create service
  const createService = useCallback(async (serviceData) => {
    try {
      // In production:
      // const response = await fetch(`/api/businesses/${businessId}/services`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(serviceData)
      // });
      // if (!response.ok) throw new Error('Failed to create service');
      // const newService = await response.json();

      // Mock implementation
      const newService = {
        id: `service_new_${Date.now()}`,
        businessId,
        ...serviceData,
        isActive: true,
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
      // In production:
      // const response = await fetch(`/api/services/${serviceId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update service');
      // const updatedService = await response.json();

      // Mock implementation
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, ...updates, updatedAt: new Date().toISOString() }
          : service
      ));

      // Add new category if it doesn't exist
      if (updates.category && !categories.includes(updates.category)) {
        setCategories(prev => [...prev, updates.category]);
      }

    } catch (err) {
      console.error('Failed to update service:', err);
      throw new Error('שגיאה בעדכון השירות');
    }
  }, [categories]);

  // Delete service
  const deleteService = useCallback(async (serviceId) => {
    try {
      // In production:
      // const response = await fetch(`/api/services/${serviceId}`, {
      //   method: 'DELETE'
      // });
      // if (!response.ok) throw new Error('Failed to delete service');

      // Mock implementation
      setServices(prev => prev.filter(service => service.id !== serviceId));

    } catch (err) {
      console.error('Failed to delete service:', err);
      throw new Error('שגיאה במחיקת השירות');
    }
  }, []);

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