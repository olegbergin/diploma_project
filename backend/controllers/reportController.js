const db = require('../dbSingleton');
const reportService = require('../services/reportService');
const pdfService = require('../services/pdfService');

/**
 * Generate and download business report
 * GET /api/businesses/:id/reports/generate?period=day&date=2025-01-15
 */
exports.generateReport = async (req, res) => {
  try {
    const { id: businessId } = req.params;
    const { period, date } = req.query;

    // Validate parameters
    if (!period || !date) {
      return res.status(400).json({ 
        error: "Missing required parameters: period and date" 
      });
    }

    // Validate business ID
    if (!businessId || isNaN(parseInt(businessId))) {
      return res.status(400).json({ 
        error: "Invalid business ID" 
      });
    }

    // Validate report parameters
    try {
      reportService.validateReportParams(period, date);
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }

    // Generate report data based on period
    let reportData;
    switch (period) {
      case 'day':
        reportData = await reportService.generateDailyReport(parseInt(businessId), date);
        break;
      case 'month':
        reportData = await reportService.generateMonthlyReport(parseInt(businessId), date);
        break;
      case 'year':
        reportData = await reportService.generateYearlyReport(parseInt(businessId), date);
        break;
      default:
        return res.status(400).json({ 
          error: "Invalid period. Must be 'day', 'month', or 'year'" 
        });
    }

    // Enhance report data with formatted values
    reportData = enhanceReportData(reportData);

    // Generate PDF
    const templateName = `${period}-report`;
    const pdfBuffer = await pdfService.generatePDF(templateName, reportData);

    // Get filename
    const filename = pdfService.getReportFilename(reportData);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating report:', error);
    
    if (error.message === 'Business not found') {
      return res.status(404).json({ error: "Business not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to generate report",
      details: error.message 
    });
  }
};

/**
 * Preview report data (JSON) without generating PDF
 * GET /api/businesses/:id/reports/preview?period=day&date=2025-01-15
 */
exports.previewReport = async (req, res) => {
  try {
    const { id: businessId } = req.params;
    const { period, date } = req.query;

    // Validate parameters
    if (!period || !date) {
      return res.status(400).json({ 
        error: "Missing required parameters: period and date" 
      });
    }

    if (!businessId || isNaN(parseInt(businessId))) {
      return res.status(400).json({ 
        error: "Invalid business ID" 
      });
    }

    // Validate report parameters
    try {
      reportService.validateReportParams(period, date);
    } catch (validationError) {
      return res.status(400).json({ 
        error: validationError.message 
      });
    }

    // Generate report data
    let reportData;
    switch (period) {
      case 'day':
        reportData = await reportService.generateDailyReport(parseInt(businessId), date);
        break;
      case 'month':
        reportData = await reportService.generateMonthlyReport(parseInt(businessId), date);
        break;
      case 'year':
        reportData = await reportService.generateYearlyReport(parseInt(businessId), date);
        break;
      default:
        return res.status(400).json({ 
          error: "Invalid period. Must be 'day', 'month', or 'year'" 
        });
    }

    // Return preview data
    res.json(enhanceReportData(reportData));

  } catch (error) {
    console.error('Error generating report preview:', error);
    
    if (error.message === 'Business not found') {
      return res.status(404).json({ error: "Business not found" });
    }
    
    res.status(500).json({ 
      error: "Failed to generate report preview",
      details: error.message 
    });
  }
};

/**
 * Get available report dates for a business
 * GET /api/businesses/:id/reports/available-dates
 */
exports.getAvailableDates = async (req, res) => {
  try {
    const { id: businessId } = req.params;

    if (!businessId || isNaN(parseInt(businessId))) {
      return res.status(400).json({ 
        error: "Invalid business ID" 
      });
    }

    // Get date range of available data
    const connection = db.getPromise();
    const [dateRange] = await connection.query(`
      SELECT 
        MIN(DATE(appointment_datetime)) as earliest_date,
        MAX(DATE(appointment_datetime)) as latest_date,
        COUNT(DISTINCT DATE_FORMAT(appointment_datetime, '%Y-%m')) as available_months,
        COUNT(DISTINCT YEAR(appointment_datetime)) as available_years
      FROM appointments 
      WHERE business_id = ?
    `, [businessId]);

    if (dateRange.length === 0 || !dateRange[0].earliest_date) {
      return res.json({
        hasData: false,
        message: "No appointment data available for reports"
      });
    }

    const range = dateRange[0];
    res.json({
      hasData: true,
      earliestDate: range.earliest_date,
      latestDate: range.latest_date,
      availableMonths: range.available_months,
      availableYears: range.available_years,
      suggestedDates: {
        daily: range.latest_date,
        monthly: new Date().toISOString().slice(0, 7), // Current month
        yearly: new Date().getFullYear().toString() // Current year
      }
    });

  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ 
      error: "Failed to fetch available dates" 
    });
  }
};

// === HELPER FUNCTIONS ===

/**
 * Enhance report data with formatted values for display
 * @param {Object} reportData - Raw report data
 * @returns {Object} Enhanced report data
 */
function enhanceReportData(reportData) {
  // Format currency values
  if (reportData.summary) {
    if (reportData.summary.dailyRevenue !== undefined) {
      reportData.summary.dailyRevenueFormatted = formatCurrency(reportData.summary.dailyRevenue);
    }
    if (reportData.summary.totalRevenue !== undefined) {
      reportData.summary.totalRevenueFormatted = formatCurrency(reportData.summary.totalRevenue);
    }
    if (reportData.summary.averageMonthlyRevenue !== undefined) {
      reportData.summary.averageMonthlyRevenueFormatted = formatCurrency(reportData.summary.averageMonthlyRevenue);
    }
    if (reportData.summary.averageRevenuePerDay !== undefined) {
      reportData.summary.averageRevenuePerDayFormatted = formatCurrency(reportData.summary.averageRevenuePerDay);
    }
  }

  // Format service breakdown
  if (reportData.serviceBreakdown) {
    reportData.serviceBreakdown = reportData.serviceBreakdown.map(service => ({
      ...service,
      revenueFormatted: formatCurrency(service.revenue)
    }));
  }

  // Format daily revenue data
  if (reportData.dailyRevenue) {
    reportData.dailyRevenue = reportData.dailyRevenue.map(day => ({
      ...day,
      daily_revenue_formatted: formatCurrency(day.daily_revenue)
    }));
  }

  // Format service performance
  if (reportData.servicePerformance) {
    reportData.servicePerformance = reportData.servicePerformance.map(service => ({
      ...service,
      service_revenue_formatted: formatCurrency(service.service_revenue),
      average_price_formatted: formatCurrency(service.average_price)
    }));
  }

  // Format monthly breakdown
  if (reportData.monthlyBreakdown) {
    reportData.monthlyBreakdown = reportData.monthlyBreakdown.map(month => ({
      ...month,
      monthly_revenue_formatted: formatCurrency(month.monthly_revenue)
    }));
  }

  // Format top services
  if (reportData.topServices) {
    reportData.topServices = reportData.topServices.map(service => ({
      ...service,
      service_revenue_formatted: formatCurrency(service.service_revenue)
    }));
  }

  // Add generation timestamp
  reportData.generatedAt = new Date().toISOString();
  reportData.generatedAtFormatted = formatDate(new Date());

  return reportData;
}

/**
 * Helper function to format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount || 0);
}

/**
 * Helper function to format date
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}