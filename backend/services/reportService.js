const db = require("../dbSingleton").getPromise();

/**
 * Report Service - Handles data aggregation and report generation
 * Provides comprehensive analytics for businesses
 */

class ReportService {
  /**
   * Generate daily report data for a business
   * @param {number} businessId - Business ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object} Daily report data
   */
  async generateDailyReport(businessId, date) {
    try {
      const [businessInfo] = await db.query(
        'SELECT * FROM businesses WHERE business_id = ?',
        [businessId]
      );

      if (businessInfo.length === 0) {
        throw new Error('Business not found');
      }

      // Get daily appointments
      const [appointments] = await db.query(`
        SELECT a.*, 
               u.first_name, u.last_name, u.phone,
               s.name as service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN users u ON a.customer_id = u.user_id
        LEFT JOIN services s ON a.service_id = s.service_id
        WHERE a.business_id = ? 
          AND DATE(a.appointment_datetime) = ?
        ORDER BY a.appointment_datetime ASC
      `, [businessId, date]);

      // Calculate daily metrics
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
      const cancelledAppointments = appointments.filter(apt => 
        apt.status === 'cancelled_by_user' || apt.status === 'cancelled_by_business').length;
      const noShowAppointments = appointments.filter(apt => apt.status === 'not_arrived').length;
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

      // Calculate daily revenue
      const dailyRevenue = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      // Service breakdown
      const serviceStats = {};
      appointments.forEach(apt => {
        const serviceName = apt.service_name || 'Unknown Service';
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { count: 0, revenue: 0 };
        }
        serviceStats[serviceName].count++;
        if (apt.status === 'completed') {
          serviceStats[serviceName].revenue += apt.price || 0;
        }
      });

      // Hourly breakdown
      const hourlyStats = {};
      appointments.forEach(apt => {
        const hour = new Date(apt.appointment_datetime).getHours();
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      });

      // Customer analysis
      const uniqueCustomers = new Set(appointments.map(apt => apt.customer_id)).size;
      const newCustomers = await this.getNewCustomersCount(businessId, date);

      return {
        business: businessInfo[0],
        reportDate: date,
        reportType: 'daily',
        summary: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          pendingAppointments,
          dailyRevenue,
          uniqueCustomers,
          newCustomers,
          completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0
        },
        appointments,
        serviceBreakdown: Object.entries(serviceStats).map(([name, stats]) => ({
          serviceName: name,
          ...stats
        })),
        hourlyDistribution: Object.entries(hourlyStats).map(([hour, count]) => ({
          hour: `${hour}:00`,
          appointments: count
        })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
      };
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  /**
   * Generate monthly report data for a business
   * @param {number} businessId - Business ID
   * @param {string} month - Month in YYYY-MM format
   * @returns {Object} Monthly report data
   */
  async generateMonthlyReport(businessId, month) {
    try {
      const [businessInfo] = await db.query(
        'SELECT * FROM businesses WHERE business_id = ?',
        [businessId]
      );

      if (businessInfo.length === 0) {
        throw new Error('Business not found');
      }

      const startDate = `${month}-01`;
      const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
        .toISOString().split('T')[0];

      // Monthly appointments
      const [appointments] = await db.query(`
        SELECT a.*, s.name as service_name, s.price, s.duration_minutes
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.service_id
        WHERE a.business_id = ? 
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
      `, [businessId, startDate, endDate]);

      // Monthly revenue
      const [revenueData] = await db.query(`
        SELECT 
          DATE(a.appointment_datetime) as date,
          SUM(s.price) as daily_revenue,
          COUNT(*) as daily_appointments
        FROM appointments a
        JOIN services s ON a.service_id = s.service_id
        WHERE a.business_id = ? 
          AND a.status = 'completed'
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
        GROUP BY DATE(a.appointment_datetime)
        ORDER BY date ASC
      `, [businessId, startDate, endDate]);

      // Service performance
      const [servicePerformance] = await db.query(`
        SELECT 
          s.name as service_name,
          COUNT(a.appointment_id) as total_bookings,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_bookings,
          SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as service_revenue,
          AVG(s.price) as average_price
        FROM services s
        LEFT JOIN appointments a ON s.service_id = a.service_id 
          AND DATE(a.appointment_datetime) >= ? 
          AND DATE(a.appointment_datetime) <= ?
        WHERE s.business_id = ?
        GROUP BY s.service_id, s.name
        ORDER BY service_revenue DESC
      `, [startDate, endDate, businessId]);

      // Customer metrics
      const [customerMetrics] = await db.query(`
        SELECT 
          COUNT(DISTINCT a.customer_id) as unique_customers,
          COUNT(CASE WHEN customer_first_visit.first_date >= ? THEN 1 END) as new_customers,
          AVG(customer_frequency.visit_count) as avg_visits_per_customer
        FROM appointments a
        LEFT JOIN (
          SELECT customer_id, MIN(DATE(appointment_datetime)) as first_date
          FROM appointments
          WHERE business_id = ?
          GROUP BY customer_id
        ) customer_first_visit ON a.customer_id = customer_first_visit.customer_id
        LEFT JOIN (
          SELECT customer_id, COUNT(*) as visit_count
          FROM appointments
          WHERE business_id = ?
            AND DATE(appointment_datetime) >= ?
            AND DATE(appointment_datetime) <= ?
            AND status = 'completed'
          GROUP BY customer_id
        ) customer_frequency ON a.customer_id = customer_frequency.customer_id
        WHERE a.business_id = ?
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
      `, [startDate, businessId, businessId, startDate, endDate, businessId, startDate, endDate]);

      // Reviews for the month
      const [monthlyReviews] = await db.query(`
        SELECT 
          AVG(r.rating) as average_rating,
          COUNT(r.review_id) as total_reviews
        FROM reviews r
        JOIN appointments a ON r.appointment_id = a.appointment_id
        WHERE a.business_id = ?
          AND DATE(r.created_at) >= ?
          AND DATE(r.created_at) <= ?
          AND r.is_hidden = FALSE
      `, [businessId, startDate, endDate]);

      const totalRevenue = revenueData.reduce((sum, day) => sum + parseFloat(day.daily_revenue || 0), 0);
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;

      return {
        business: businessInfo[0],
        reportMonth: month,
        reportType: 'monthly',
        summary: {
          totalAppointments,
          completedAppointments,
          totalRevenue,
          averageRevenuePerDay: revenueData.length > 0 ? (totalRevenue / revenueData.length).toFixed(2) : 0,
          completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
          uniqueCustomers: customerMetrics[0]?.unique_customers || 0,
          newCustomers: customerMetrics[0]?.new_customers || 0,
          averageRating: monthlyReviews[0]?.average_rating ? parseFloat(monthlyReviews[0].average_rating).toFixed(1) : 'N/A',
          totalReviews: monthlyReviews[0]?.total_reviews || 0
        },
        dailyRevenue: revenueData,
        servicePerformance,
        customerMetrics: customerMetrics[0] || {}
      };
    } catch (error) {
      console.error('Error generating monthly report:', error);
      throw error;
    }
  }

  /**
   * Generate yearly report data for a business
   * @param {number} businessId - Business ID
   * @param {string} year - Year in YYYY format
   * @returns {Object} Yearly report data
   */
  async generateYearlyReport(businessId, year) {
    try {
      const [businessInfo] = await db.query(
        'SELECT * FROM businesses WHERE business_id = ?',
        [businessId]
      );

      if (businessInfo.length === 0) {
        throw new Error('Business not found');
      }

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      // Monthly breakdown
      const [monthlyData] = await db.query(`
        SELECT 
          DATE_FORMAT(a.appointment_datetime, '%Y-%m') as month,
          COUNT(a.appointment_id) as total_appointments,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
          SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as monthly_revenue
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.service_id
        WHERE a.business_id = ?
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
        GROUP BY DATE_FORMAT(a.appointment_datetime, '%Y-%m')
        ORDER BY month ASC
      `, [businessId, startDate, endDate]);

      // Year-over-year growth (if previous year data exists)
      const previousYear = (parseInt(year) - 1).toString();
      const [previousYearData] = await db.query(`
        SELECT 
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as prev_year_appointments,
          SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as prev_year_revenue
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.service_id
        WHERE a.business_id = ?
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
      `, [businessId, `${previousYear}-01-01`, `${previousYear}-12-31`]);

      // Top performing services
      const [topServices] = await db.query(`
        SELECT 
          s.name as service_name,
          COUNT(a.appointment_id) as total_bookings,
          SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END) as service_revenue
        FROM services s
        LEFT JOIN appointments a ON s.service_id = a.service_id 
          AND DATE(a.appointment_datetime) >= ? 
          AND DATE(a.appointment_datetime) <= ?
        WHERE s.business_id = ?
        GROUP BY s.service_id, s.name
        ORDER BY service_revenue DESC
        LIMIT 10
      `, [startDate, endDate, businessId]);

      // Customer retention analysis
      const [customerRetention] = await db.query(`
        SELECT 
          COUNT(DISTINCT a.customer_id) as total_customers,
          COUNT(DISTINCT CASE WHEN repeat_customers.visit_count > 1 THEN a.customer_id END) as returning_customers
        FROM appointments a
        LEFT JOIN (
          SELECT customer_id, COUNT(*) as visit_count
          FROM appointments
          WHERE business_id = ?
            AND DATE(appointment_datetime) >= ?
            AND DATE(appointment_datetime) <= ?
            AND status = 'completed'
          GROUP BY customer_id
        ) repeat_customers ON a.customer_id = repeat_customers.customer_id
        WHERE a.business_id = ?
          AND DATE(a.appointment_datetime) >= ?
          AND DATE(a.appointment_datetime) <= ?
      `, [businessId, startDate, endDate, businessId, startDate, endDate]);

      const totalRevenue = monthlyData.reduce((sum, month) => sum + parseFloat(month.monthly_revenue || 0), 0);
      const totalAppointments = monthlyData.reduce((sum, month) => sum + parseInt(month.total_appointments || 0), 0);
      const completedAppointments = monthlyData.reduce((sum, month) => sum + parseInt(month.completed_appointments || 0), 0);

      // Calculate growth rates
      const prevYearRevenue = previousYearData[0]?.prev_year_revenue || 0;
      const prevYearAppointments = previousYearData[0]?.prev_year_appointments || 0;
      
      const revenueGrowth = prevYearRevenue > 0 ? 
        (((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100).toFixed(1) : 'N/A';
      const appointmentGrowth = prevYearAppointments > 0 ? 
        (((completedAppointments - prevYearAppointments) / prevYearAppointments) * 100).toFixed(1) : 'N/A';

      return {
        business: businessInfo[0],
        reportYear: year,
        reportType: 'yearly',
        summary: {
          totalRevenue,
          totalAppointments,
          completedAppointments,
          averageMonthlyRevenue: monthlyData.length > 0 ? (totalRevenue / monthlyData.length).toFixed(2) : 0,
          revenueGrowth,
          appointmentGrowth,
          totalCustomers: customerRetention[0]?.total_customers || 0,
          returningCustomers: customerRetention[0]?.returning_customers || 0,
          retentionRate: customerRetention[0]?.total_customers > 0 ? 
            ((customerRetention[0].returning_customers / customerRetention[0].total_customers) * 100).toFixed(1) : 0
        },
        monthlyBreakdown: monthlyData,
        topServices,
        customerRetention: customerRetention[0] || {},
        previousYearComparison: previousYearData[0] || {}
      };
    } catch (error) {
      console.error('Error generating yearly report:', error);
      throw error;
    }
  }

  /**
   * Helper function to get new customers count for a specific date
   */
  async getNewCustomersCount(businessId, date) {
    const [newCustomers] = await db.query(`
      SELECT COUNT(*) as new_customers_count
      FROM (
        SELECT customer_id, MIN(DATE(appointment_datetime)) as first_visit
        FROM appointments
        WHERE business_id = ?
        GROUP BY customer_id
        HAVING first_visit = ?
      ) first_visits
    `, [businessId, date]);

    return newCustomers[0]?.new_customers_count || 0;
  }

  /**
   * Validate report parameters
   */
  validateReportParams(period, date) {
    const validPeriods = ['day', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      throw new Error('Invalid period. Must be day, month, or year');
    }

    if (period === 'day' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format for daily report. Use YYYY-MM-DD');
    }

    if (period === 'month' && !/^\d{4}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format for monthly report. Use YYYY-MM');
    }

    if (period === 'year' && !/^\d{4}$/.test(date)) {
      throw new Error('Invalid date format for yearly report. Use YYYY');
    }

    return true;
  }
}

module.exports = new ReportService();