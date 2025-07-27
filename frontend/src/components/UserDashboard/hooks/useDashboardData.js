import { useState, useEffect, useCallback } from 'react';
import axios from '../../../config/axios';

export function useDashboardData(userId) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data fallback - in case API fails
  const mockDashboardData = {
    totalBookings: 12,
    upcomingBookings: 3,
    favoriteBusinesses: 7,
    averageRating: 4.8,
    recentActivities: [
      {
        id: 1,
        type: 'booking',
        title: 'תור חדש נקבע',
        description: 'תור בסלון יופי "אלגנס" ליום ראשון בשעה 14:00',
        time: 'לפני שעתיים',
        icon: '📅',
        status: 'confirmed',
        business: 'סלון יופי אלגנס'
      },
      {
        id: 2,
        type: 'favorite',
        title: 'נוסף למועדפים',
        description: 'מספרת "סטייל & חן" נוספה לרשימת המועדפים',
        time: 'אתמול',
        icon: '⭐',
        status: 'active',
        business: 'מספרת סטייל & חן'
      },
      {
        id: 3,
        type: 'review',
        title: 'ביקורת נשלחה',
        description: 'דירוג 5 כוכבים למסג\'ה במכון "רוגע"',
        time: 'לפני 2 ימים',
        icon: '🌟',
        status: 'published',
        business: 'מכון רוגע'
      },
      {
        id: 4,
        type: 'cancelled',
        title: 'תור בוטל',
        description: 'תור במספרה "קליפ" בוטל לבקשתך',
        time: 'לפני 3 ימים',
        icon: '❌',
        status: 'cancelled',
        business: 'מספרה קליפ'
      },
      {
        id: 5,
        type: 'completed',
        title: 'תור הושלם',
        description: 'ביקור בקוסמטיקאית "גלוריה" הושלם בהצלחה',
        time: 'לפני שבוע',
        icon: '✅',
        status: 'completed',
        business: 'קוסמטיקאית גלוריה'
      }
    ],
    monthlyStats: {
      bookings: [2, 3, 1, 4, 2, 3, 5, 2, 1, 3, 4, 2],
      spending: [150, 220, 80, 320, 180, 250, 410, 160, 90, 280, 380, 200]
    },
    topCategories: [
      { name: 'יופי ועיצוב', count: 6, percentage: 50 },
      { name: 'בריאות ורווחה', count: 4, percentage: 33 },
      { name: 'קוסמטיקה', count: 2, percentage: 17 }
    ]
  };

  const fetchDashboardData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch dashboard data from API
      const response = await axios.get(`/users/${userId}/dashboard`);
      const data = response.data;
      
      // Transform API data to match expected structure
      const transformedData = {
        totalBookings: data.totalBookings || 0,
        upcomingBookings: data.upcomingBookings || 0,
        favoriteBusinesses: data.favoriteBusinesses || 0,
        averageRating: data.averageRating || 4.5,
        recentActivities: data.recentActivities || [],
        monthlyStats: data.monthlyStats || null,
        topCategories: data.topCategories || [],
        upcomingAppointments: data.upcomingAppointments || [],
        pastAppointments: data.pastAppointments || [],
        favorites: data.favorites || []
      };
      
      setDashboardData(transformedData);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch dashboard data:', err);
      
      // Fallback to mock data if API fails
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshData = useCallback(async () => {
    return fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refreshData
  };
}