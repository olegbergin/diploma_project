import { useState, useEffect, useCallback } from 'react';
import axios from '../../../config/axios';

export function useDashboardData(businessId) {
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState({ unread: 0, items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format time ago
  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) return 'לא ידוע';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'לפני פחות משעה';
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    return `לפני ${Math.floor(diffDays / 30)} חודשים`;
  }, []);

  // Fallback mock data generator for development (in case API fails)
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
      // Fetch dashboard data from API
      const response = await axios.get(`/api/businesses/${businessId}/dashboard`);
      const data = response.data;
      
      setBusiness(data.business);
      
      // Transform API data to match expected analytics structure
      const transformedAnalytics = {
        revenue: {
          current: data.analytics?.total_revenue || 0,
          previous: data.analytics?.monthly_revenue || 0,
          change: data.analytics?.total_revenue > 0 ? 
            ((data.analytics.total_revenue - data.analytics.monthly_revenue) / data.analytics.monthly_revenue * 100) : 0,
          trend: 'up'
        },
        appointments: {
          current: data.analytics?.total_appointments || 0,
          previous: data.analytics?.monthly_appointments || 0,
          change: data.analytics?.total_appointments > 0 ? 
            ((data.analytics.total_appointments - data.analytics.monthly_appointments) / data.analytics.monthly_appointments * 100) : 0,
          trend: 'up'
        },
        customers: {
          current: data.analytics?.approved_appointments || 0,
          previous: data.analytics?.monthly_appointments || 0,
          change: 9.9,
          trend: 'up'
        },
        rating: {
          current: 4.8, // TODO: Calculate from reviews
          previous: 4.6,
          change: 4.3,
          trend: 'up'
        },
        chartData: {
          revenue: data.analytics?.monthly_trends?.map(trend => ({
            date: trend.month,
            value: parseFloat(trend.revenue) || 0
          })) || [],
          appointments: Array.from({ length: 7 }, (_, i) => ({
            day: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][i],
            value: Math.floor((data.analytics?.weekly_appointments || 0) / 7) + Math.floor(Math.random() * 5)
          })),
          topServices: data.analytics?.service_stats?.map(service => ({
            name: service.service_name,
            bookings: service.booking_count,
            revenue: parseFloat(service.service_revenue) || 0
          })).slice(0, 4) || []
        }
      };
      
      setAnalytics(transformedAnalytics);
      
      // Transform recent appointments to activity format
      const transformedActivity = data.recent_appointments?.map((appointment, index) => ({
        id: appointment.appointment_id || index,
        type: appointment.status === 'pending' ? 'booking' : 
              appointment.status === 'cancelled' ? 'cancellation' : 'booking',
        title: appointment.status === 'pending' ? 'הזמנה חדשה' :
               appointment.status === 'cancelled' ? 'ביטול הזמנה' : 'הזמנה הושלמה',
        description: `${appointment.first_name || 'לקוח'} ${appointment.last_name || ''} - ${appointment.service_name || 'שירות'}`,
        time: formatTimeAgo(appointment.appointment_datetime),
        icon: appointment.status === 'pending' ? '📅' : 
              appointment.status === 'cancelled' ? '❌' : '✅',
        priority: appointment.status === 'pending' ? 'high' : 'normal'
      })).slice(0, 5) || [];
      
      setRecentActivity(transformedActivity);
      
      // Transform notifications
      const transformedNotifications = {
        unread: data.notifications?.pending_count || 0,
        items: [
          ...(data.notifications?.pending_count > 0 ? [{
            id: 1,
            title: 'תורים ממתינים לאישור',
            message: `יש לך ${data.notifications.pending_count} תורים ממתינים לאישור`,
            time: 'עכשיו',
            type: 'urgent',
            read: false
          }] : []),
          ...(data.notifications?.today_count > 0 ? [{
            id: 2,
            title: 'תורים להיום',
            message: `יש לך ${data.notifications.today_count} תורים מתוכננים להיום`,
            time: 'לפני שעה',
            type: 'info',
            read: false
          }] : [])
        ]
      };
      
      setNotifications(transformedNotifications);
      
    } catch (err) {
      setError('שגיאה بטעינת נתוני הדשבורד. אנא נסה שוב.');
      console.error('Dashboard data loading error:', err);
      
      // Fallback to mock data if API fails
      console.log('Falling back to mock data...');
      const mockData = generateMockData();
      setBusiness(mockData.business);
      setAnalytics(mockData.analytics);
      setRecentActivity(mockData.recentActivity);
      setNotifications(mockData.notifications);
    } finally {
      setIsLoading(false);
    }
  }, [businessId, generateMockData, formatTimeAgo]);

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