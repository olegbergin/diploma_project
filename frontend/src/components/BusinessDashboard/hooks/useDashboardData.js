import { useState, useEffect, useCallback } from 'react';

export function useDashboardData(businessId) {
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState({ unread: 0, items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data generator for development
  const generateMockData = useCallback(() => {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Business info
    const mockBusiness = {
      id: businessId,
      name: "מאפיית איילה",
      category: "מאפיה",
      description: "המאפיה הטובה ביותר בעיר",
      phone: "054-1112223",
      address: "הנרייטה סולד 7, חיפה",
      email: "ayala.bakery@gmail.com",
      image_url: "/images/placeholder_business.png",
      hours: "א-ה 07:00-20:00, ו׳ 07:00-13:30",
      rating: 4.8,
      reviewCount: 127
    };

    // Analytics data
    const mockAnalytics = {
      revenue: {
        current: 45200,
        previous: 38900,
        change: 16.2,
        trend: 'up'
      },
      appointments: {
        current: 284,
        previous: 251,
        change: 13.1,
        trend: 'up'
      },
      customers: {
        current: 156,
        previous: 142,
        change: 9.9,
        trend: 'up'
      },
      rating: {
        current: 4.8,
        previous: 4.6,
        change: 4.3,
        trend: 'up'
      },
      chartData: {
        revenue: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(thisYear, thisMonth, i + 1).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 2000) + 1000 + (i * 50)
        })),
        appointments: Array.from({ length: 7 }, (_, i) => ({
          day: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][i],
          value: Math.floor(Math.random() * 20) + 5
        })),
        topServices: [
          { name: 'חלה לשבת', bookings: 45, revenue: 1350 },
          { name: 'עוגיות', bookings: 32, revenue: 960 },
          { name: 'לחם מחמצת', bookings: 28, revenue: 840 },
          { name: 'קרואסונים', bookings: 21, revenue: 630 }
        ]
      }
    };

    // Recent activity
    const mockActivity = [
      {
        id: 1,
        type: 'booking',
        title: 'הזמנה חדשה',
        description: 'רחל כהן הזמינה חלה לשבת',
        time: '10 דקות',
        icon: '📅',
        priority: 'normal'
      },
      {
        id: 2,
        type: 'review',
        title: 'ביקורת חדשה',
        description: 'דוד לוי נתן ביקורת 5 כוכבים',
        time: '25 דקות',
        icon: '⭐',
        priority: 'high'
      },
      {
        id: 3,
        type: 'payment',
        title: 'תשלום התקבל',
        description: 'תשלום של ₪180 מיעל גבריאל',
        time: '1 שעה',
        icon: '💳',
        priority: 'normal'
      },
      {
        id: 4,
        type: 'cancellation',
        title: 'ביטול הזמנה',
        description: 'מיכל דהן ביטלה הזמנה',
        time: '2 שעות',
        icon: '❌',
        priority: 'low'
      },
      {
        id: 5,
        type: 'booking',
        title: 'הזמנה חדשה',
        description: 'אברהם מזרחי הזמין עוגיות',
        time: '3 שעות',
        icon: '📅',
        priority: 'normal'
      }
    ];

    // Notifications
    const mockNotifications = {
      unread: 3,
      items: [
        {
          id: 1,
          title: 'הזמנה דחופה',
          message: 'לקוח מבקש משלוח עד 17:00',
          time: '5 דקות',
          type: 'urgent',
          read: false
        },
        {
          id: 2,
          title: 'ביקורת חדשה',
          message: '5 כוכבים מלקוח חדש',
          time: '1 שעה',
          type: 'positive',
          read: false
        },
        {
          id: 3,
          title: 'תזכורת',
          message: 'מלאי קמח נמוך',
          time: '2 שעות',
          type: 'warning',
          read: false
        },
        {
          id: 4,
          title: 'הודעה',
          message: 'עדכון מערכת הושלם',
          time: '1 יום',
          type: 'info',
          read: true
        }
      ]
    };

    return {
      business: mockBusiness,
      analytics: mockAnalytics,
      recentActivity: mockActivity,
      notifications: mockNotifications
    };
  }, []);

  // Load data function
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // In production, this would be actual API calls
      // const [businessRes, analyticsRes, activityRes, notificationsRes] = await Promise.all([
      //   fetch(`/api/businesses/${businessId}`),
      //   fetch(`/api/businesses/${businessId}/analytics`),
      //   fetch(`/api/businesses/${businessId}/activity`),
      //   fetch(`/api/businesses/${businessId}/notifications`)
      // ]);

      // For now, use mock data
      const mockData = generateMockData();
      
      setBusiness(mockData.business);
      setAnalytics(mockData.analytics);
      setRecentActivity(mockData.recentActivity);
      setNotifications(mockData.notifications);
      
    } catch (err) {
      setError('שגיאה בטעינת נתוני הדשבורד. אנא נסה שוב.');
      console.error('Dashboard data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, generateMockData]);

  // Refresh data function
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount and when businessId changes
  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId, loadData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && businessId) {
        loadData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, businessId, loadData]);

  return {
    business,
    analytics,
    recentActivity,
    notifications,
    isLoading,
    error,
    refreshData
  };
}