import React from 'react';
import styles from './ReportPreview.module.css';

export default function ReportPreview({ reportData, onDownload, loading }) {
  if (!reportData) {
    return (
      <div className={styles.emptyState}>
        <p>בחר סוג דוח ותאריך, ולחץ על "תצוגה מקדימה" כדי לראות את הדוח</p>
      </div>
    );
  }

  const { reportType, business } = reportData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPercent = (value) => {
    return `${parseFloat(value || 0).toFixed(1)}%`;
  };

  const handlePrint = () => {
    window.print();
  };

  const renderDailyReport = () => {
    const { summary, serviceBreakdown, hourlyDistribution, reportDate } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.subtitle}>דוח יומי - {formatDate(reportDate)}</p>
        </div>

        {/* Summary Table */}
        <table className={styles.summaryTable}>
          <tbody>
            <tr>
              <th>סה"כ תורים</th>
              <td>{summary.totalAppointments}</td>
              <th>הושלמו</th>
              <td>{summary.completedAppointments}</td>
            </tr>
            <tr>
              <th>הכנסות יומיות</th>
              <td><strong>{formatCurrency(summary.dailyRevenue)}</strong></td>
              <th>אחוז השלמה</th>
              <td>{formatPercent(summary.completionRate)}</td>
            </tr>
            <tr>
              <th>לקוחות ייחודיים</th>
              <td>{summary.uniqueCustomers}</td>
              <th>לקוחות חדשים</th>
              <td>{summary.newCustomers}</td>
            </tr>
            <tr>
              <th>ביטולים</th>
              <td>{summary.cancelledAppointments}</td>
              <th>לא הגיעו</th>
              <td>{summary.noShowAppointments}</td>
            </tr>
          </tbody>
        </table>

        {/* Services Table */}
        {serviceBreakdown && serviceBreakdown.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>פילוח שירותים</h3>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>שירות</th>
                  <th>תורים</th>
                  <th>הכנסות</th>
                </tr>
              </thead>
              <tbody>
                {serviceBreakdown.map((service, index) => (
                  <tr key={index}>
                    <td>{service.serviceName}</td>
                    <td>{service.count}</td>
                    <td>{formatCurrency(service.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Hourly Distribution Table */}
        {hourlyDistribution && hourlyDistribution.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>פילוח שעתי</h3>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>שעה</th>
                  <th>כמות תורים</th>
                </tr>
              </thead>
              <tbody>
                {hourlyDistribution
                  .filter(h => h.appointments > 0)
                  .map((hour, index) => (
                    <tr key={index}>
                      <td>{hour.hour}</td>
                      <td>{hour.appointments}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </>
    );
  };

  const renderMonthlyReport = () => {
    const { summary, servicePerformance, dailyRevenue, reportMonth } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.subtitle}>דוח חודשי - {reportMonth}</p>
        </div>

        {/* Summary Table */}
        <table className={styles.summaryTable}>
          <tbody>
            <tr>
              <th>סה"כ תורים</th>
              <td>{summary.totalAppointments}</td>
              <th>הושלמו</th>
              <td>{summary.completedAppointments}</td>
            </tr>
            <tr>
              <th>הכנסות כוללות</th>
              <td><strong>{formatCurrency(summary.totalRevenue)}</strong></td>
              <th>ממוצע יומי</th>
              <td>{formatCurrency(summary.averageRevenuePerDay)}</td>
            </tr>
            <tr>
              <th>לקוחות ייחודיים</th>
              <td>{summary.uniqueCustomers}</td>
              <th>לקוחות חדשים</th>
              <td>{summary.newCustomers}</td>
            </tr>
            <tr>
              <th>ממוצע דירוג</th>
              <td>{summary.averageRating}</td>
              <th>ביקורות</th>
              <td>{summary.totalReviews}</td>
            </tr>
          </tbody>
        </table>

        {/* Services Performance Table */}
        {servicePerformance && servicePerformance.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>ביצועי שירותים</h3>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>שירות</th>
                  <th>הושלמו</th>
                  <th>סה"כ</th>
                  <th>הכנסות</th>
                </tr>
              </thead>
              <tbody>
                {servicePerformance.slice(0, 10).map((service, index) => (
                  <tr key={index}>
                    <td>{service.service_name}</td>
                    <td>{service.completed_bookings}</td>
                    <td>{service.total_bookings}</td>
                    <td>{formatCurrency(service.service_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Daily Revenue Summary */}
        {dailyRevenue && dailyRevenue.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>סיכום יומי</h3>
            <table className={styles.summaryTable}>
              <tbody>
                <tr>
                  <th>ימים עם פעילות</th>
                  <td>{dailyRevenue.length}</td>
                  <th>הכנסה מקסימלית ביום</th>
                  <td>{formatCurrency(Math.max(...dailyRevenue.map(d => parseFloat(d.daily_revenue || 0))))}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </>
    );
  };

  const renderYearlyReport = () => {
    const { summary, monthlyBreakdown, topServices, reportYear } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.subtitle}>דוח שנתי - {reportYear}</p>
        </div>

        {/* Summary Table */}
        <table className={styles.summaryTable}>
          <tbody>
            <tr>
              <th>סה"כ תורים</th>
              <td>{summary.totalAppointments}</td>
              <th>הושלמו</th>
              <td>{summary.completedAppointments}</td>
            </tr>
            <tr>
              <th>הכנסות שנתיות</th>
              <td><strong>{formatCurrency(summary.totalRevenue)}</strong></td>
              <th>ממוצע חודשי</th>
              <td>{formatCurrency(summary.averageMonthlyRevenue)}</td>
            </tr>
            <tr>
              <th>סה"כ לקוחות</th>
              <td>{summary.totalCustomers}</td>
              <th>לקוחות חוזרים</th>
              <td>{summary.returningCustomers}</td>
            </tr>
            <tr>
              <th>אחוז שימור</th>
              <td>{formatPercent(summary.retentionRate)}</td>
              <th></th>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Growth Table */}
        {summary.revenueGrowth !== 'N/A' && (
          <>
            <h3 className={styles.sectionTitle}>צמיחה שנה-על-שנה</h3>
            <table className={styles.summaryTable}>
              <tbody>
                <tr>
                  <th>צמיחה בהכנסות</th>
                  <td className={parseFloat(summary.revenueGrowth) >= 0 ? styles.positive : styles.negative}>
                    {summary.revenueGrowth}%
                  </td>
                  <th>צמיחה בתורים</th>
                  <td className={parseFloat(summary.appointmentGrowth) >= 0 ? styles.positive : styles.negative}>
                    {summary.appointmentGrowth}%
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Top Services Table */}
        {topServices && topServices.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>השירותים המובילים</h3>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>שירות</th>
                  <th>הזמנות</th>
                  <th>הכנסות</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((service, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{service.service_name}</td>
                    <td>{service.total_bookings}</td>
                    <td>{formatCurrency(service.service_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Monthly Breakdown Table */}
        {monthlyBreakdown && monthlyBreakdown.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>פילוח חודשי</h3>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>חודש</th>
                  <th>תורים</th>
                  <th>הושלמו</th>
                  <th>הכנסות</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map((month, index) => (
                  <tr key={index}>
                    <td>{month.month}</td>
                    <td>{month.total_appointments}</td>
                    <td>{month.completed_appointments}</td>
                    <td>{formatCurrency(month.monthly_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </>
    );
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewContent}>
        {reportType === 'day' && renderDailyReport()}
        {reportType === 'month' && renderMonthlyReport()}
        {reportType === 'year' && renderYearlyReport()}
      </div>

      <div className={styles.previewActions}>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handlePrint}
        >
          🖨️ הדפס
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onDownload}
          disabled={loading}
        >
          {loading ? 'מפיק PDF...' : '📄 הורד PDF'}
        </button>
      </div>
    </div>
  );
}
