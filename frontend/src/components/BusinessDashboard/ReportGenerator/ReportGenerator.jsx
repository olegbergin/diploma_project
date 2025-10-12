import React, { useState, useEffect } from 'react';
import styles from './ReportGenerator.module.css';
import axiosInstance from '../../../api/axiosInstance';

const ReportGenerator = ({ businessId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableDates();
      setDefaultDate();
    }
  }, [isOpen, businessId]);

  useEffect(() => {
    setDefaultDate();
  }, [reportType]);

  const fetchAvailableDates = async () => {
    try {
      const response = await axiosInstance.get(`/businesses/${businessId}/reports/available-dates`);
      setAvailableDates(response.data);
    } catch (error) {
      console.error('Error fetching available dates:', error);
    }
  };

  const setDefaultDate = () => {
    const today = new Date();
    switch (reportType) {
      case 'day':
        setSelectedDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        setSelectedDate(today.toISOString().slice(0, 7));
        break;
      case 'year':
        setSelectedDate(today.getFullYear().toString());
        break;
      default:
        setSelectedDate('');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedDate) {
      setError('אנא בחר תאריך');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate and download PDF
      const response = await axiosInstance.get(
        `/businesses/${businessId}/reports/generate`,
        {
          params: {
            period: reportType,
            date: selectedDate
          },
          responseType: 'blob'
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const businessName = 'business';
      const dateStr = selectedDate.replace(/[^0-9]/g, '_');
      link.download = `${businessName}_${reportType}_report_${dateStr}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Close modal on success
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(
        error.response?.data?.error || 
        'שגיאה ביצירת הדוח. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewReport = async () => {
    if (!selectedDate) {
      setError('אנא בחר תאריך');
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/reports/preview`,
        {
          params: {
            period: reportType,
            date: selectedDate
          }
        }
      );

      // Open preview in new window
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`
        <html>
          <head>
            <title>תצוגה מקדימה - דוח ${getReportTypeLabel()}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                direction: rtl; 
                text-align: right;
                margin: 20px;
                line-height: 1.6;
              }
              .header { 
                background: #667eea; 
                color: white; 
                padding: 20px; 
                margin-bottom: 20px;
                border-radius: 8px;
              }
              .metric { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 10px 0;
                border-radius: 5px;
                border-right: 4px solid #667eea;
              }
              .metric strong { color: #667eea; }
              pre { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px;
                overflow-x: auto;
                direction: ltr;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>תצוגה מקדימה - דוח ${getReportTypeLabel()}</h1>
              <p>תאריך: ${selectedDate}</p>
            </div>
            <div class="metric">
              <strong>סוג דוח:</strong> ${getReportTypeLabel()}
            </div>
            <div class="metric">
              <strong>תאריך:</strong> ${selectedDate}
            </div>
            <h3>נתוני הדוח:</h3>
            <pre>${JSON.stringify(response.data, null, 2)}</pre>
          </body>
        </html>
      `);
      previewWindow.document.close();
    } catch (error) {
      console.error('Error previewing report:', error);
      setError('שגיאה בתצוגה מקדימה');
    }
  };

  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'day': return 'יומי';
      case 'month': return 'חודשי';
      case 'year': return 'שנתי';
      default: return '';
    }
  };

  const getDateInputType = () => {
    switch (reportType) {
      case 'day': return 'date';
      case 'month': return 'month';
      case 'year': return 'number';
      default: return 'text';
    }
  };

  const getDatePlaceholder = () => {
    switch (reportType) {
      case 'day': return 'בחר תאריך';
      case 'month': return 'בחר חודש';
      case 'year': return 'הכנס שנה (לדוגמה: 2025)';
      default: return '';
    }
  };

  if (!isOpen) {
    return (
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(true)}
      >
        📊 הפק דוח
      </button>
    );
  }

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>הפקת דוח עסקי</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>
              סוג דוח *
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              <option value="day">דוח יומי</option>
              <option value="month">דוח חודשי</option>
              <option value="year">דוח שנתי</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              תאריך *
            </label>
            {reportType === 'year' ? (
              <input
                type="number"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={getDatePlaceholder()}
                className={styles.input}
                disabled={loading}
                min="2020"
                max={new Date().getFullYear()}
              />
            ) : (
              <input
                type={getDateInputType()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={getDatePlaceholder()}
                className={styles.input}
                disabled={loading}
                max={reportType === 'day' ? new Date().toISOString().split('T')[0] : undefined}
              />
            )}
          </div>

          {availableDates && !availableDates.hasData && (
            <div className={styles.warning}>
              <p>אין נתונים זמינים לדוחות עדיין</p>
            </div>
          )}

          {availableDates && availableDates.hasData && (
            <div className={styles.info}>
              <p>נתונים זמינים מ-{availableDates.earliestDate} עד {availableDates.latestDate}</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.reportInfo}>
            <h3>הדוח יכלול:</h3>
            <ul>
              {reportType === 'day' && (
                <>
                  <li>סיכום תורים יומי</li>
                  <li>הכנסות יומיות</li>
                  <li>פילוח שירותים</li>
                  <li>פילוח שעתי</li>
                  <li>נתוני לקוחות</li>
                </>
              )}
              {reportType === 'month' && (
                <>
                  <li>ביצועים חודשיים</li>
                  <li>מגמת הכנסות יומית</li>
                  <li>ביצועי שירותים</li>
                  <li>אנליטיקת לקוחות</li>
                  <li>סיכום ביקורות</li>
                </>
              )}
              {reportType === 'year' && (
                <>
                  <li>סיכום ביצועים שנתי</li>
                  <li>ביצועים חודשיים</li>
                  <li>השירותים המובילים</li>
                  <li>אנליטיקת לקוחות מעמיקה</li>
                  <li>תובנות אסטרטגיות</li>
                  <li>המלצות לשנה הבאה</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={styles.cancelButton}
            disabled={loading}
          >
            ביטול
          </button>
          
          <button
            type="button"
            onClick={handlePreviewReport}
            className={styles.previewButton}
            disabled={loading || !selectedDate}
          >
            תצוגה מקדימה
          </button>

          <button
            type="button"
            onClick={handleGenerateReport}
            className={styles.generateButton}
            disabled={loading || !selectedDate}
          >
            {loading ? 'מפיק דוח...' : 'הפק והורד PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;