import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ReportsPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import ReportPreviewModal from './ReportPreviewModal';

export default function ReportsPage({ user }) {
  const [reportType, setReportType] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const businessId = user?.businessId || user?.id;

  useEffect(() => {
    fetchAvailableDates();
    setDefaultDate();
  }, [businessId]);

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

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const businessName = 'business';
      const dateStr = selectedDate.replace(/[^0-9]/g, '_');
      link.download = `${businessName}_${reportType}_report_${dateStr}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setError('');
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

    setLoading(true);
    setError('');

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

      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing report:', error);
      setError('שגיאה בתצוגה מקדימה');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleDownloadFromPreview = () => {
    setShowPreview(false);
    handleGenerateReport();
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

  return (
    <div className={styles.reportsPage}>
      <header className={styles.header}>
        <h1>דוחות עסקיים</h1>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => navigate('/business/' + businessId + '/dashboard')}
        >
          ← חזרה לדשבורד
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>הגדרות דוח</h3>

            <div className={styles.field}>
              <label className={styles.label}>סוג דוח *</label>
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
              <label className={styles.label}>תאריך *</label>
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

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handlePreviewReport}
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={loading || !selectedDate}
              >
                👁️ תצוגה מקדימה
              </button>

              <button
                type="button"
                onClick={handleGenerateReport}
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={loading || !selectedDate}
              >
                {loading ? 'מפיק דוח...' : '📄 הפק והורד PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>הדוח יכלול:</h3>
            <ul className={styles.reportInfo}>
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
      </main>

      {showPreview && previewData && (
        <ReportPreviewModal
          reportData={previewData}
          onClose={handleClosePreview}
          onDownload={handleDownloadFromPreview}
        />
      )}
    </div>
  );
}
