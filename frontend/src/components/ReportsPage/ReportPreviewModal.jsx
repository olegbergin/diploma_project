import React from 'react';
import styles from './ReportPreviewModal.module.css';

export default function ReportPreviewModal({ reportData, onClose, onDownload }) {
  if (!reportData) return null;

  const { reportType, business } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDailyReport = () => {
    const { summary, serviceBreakdown, hourlyDistribution, reportDate } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.reportSubtitle}>דוח יומי - {formatDate(reportDate)}</p>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.totalAppointments}</div>
            <div className={styles.metricLabel}>סה"כ תורים</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.completedAppointments}</div>
            <div className={styles.metricLabel}>הושלמו</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{formatCurrency(summary.dailyRevenue)}</div>
            <div className={styles.metricLabel}>הכנסות</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.completionRate}%</div>
            <div className={styles.metricLabel}>אחוז השלמה</div>
          </div>
        </div>

        {serviceBreakdown && serviceBreakdown.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>פילוח שירותים</h3>
            <div className={styles.serviceList}>
              {serviceBreakdown.map((service, index) => (
                <div key={index} className={styles.serviceItem}>
                  <span className={styles.serviceName}>{service.serviceName}</span>
                  <span className={styles.serviceStats}>
                    {service.count} תורים · {formatCurrency(service.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hourlyDistribution && hourlyDistribution.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>שעות עומס</h3>
            <div className={styles.hourlyList}>
              {hourlyDistribution
                .filter(h => h.appointments > 0)
                .slice(0, 5)
                .map((hour, index) => (
                  <div key={index} className={styles.hourItem}>
                    <span className={styles.hourTime}>{hour.hour}</span>
                    <span className={styles.hourCount}>{hour.appointments} תורים</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>סטטיסטיקות נוספות</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span>לקוחות ייחודיים:</span>
              <strong>{summary.uniqueCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>לקוחות חדשים:</span>
              <strong>{summary.newCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>ביטולים:</span>
              <strong>{summary.cancelledAppointments}</strong>
            </div>
            <div className={styles.statItem}>
              <span>לא הגיעו:</span>
              <strong>{summary.noShowAppointments}</strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderMonthlyReport = () => {
    const { summary, servicePerformance, dailyRevenue, reportMonth } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.reportSubtitle}>דוח חודשי - {reportMonth}</p>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.totalAppointments}</div>
            <div className={styles.metricLabel}>סה"כ תורים</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.completedAppointments}</div>
            <div className={styles.metricLabel}>הושלמו</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{formatCurrency(summary.totalRevenue)}</div>
            <div className={styles.metricLabel}>הכנסות כוללות</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{formatCurrency(summary.averageRevenuePerDay)}</div>
            <div className={styles.metricLabel}>ממוצע יומי</div>
          </div>
        </div>

        {servicePerformance && servicePerformance.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>ביצועי שירותים</h3>
            <div className={styles.serviceList}>
              {servicePerformance.slice(0, 10).map((service, index) => (
                <div key={index} className={styles.serviceItem}>
                  <span className={styles.serviceName}>{service.service_name}</span>
                  <span className={styles.serviceStats}>
                    {service.completed_bookings} מתוך {service.total_bookings} · {formatCurrency(service.service_revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dailyRevenue && dailyRevenue.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>מגמת הכנסות יומית</h3>
            <div className={styles.revenueChart}>
              <p className={styles.chartNote}>
                {dailyRevenue.length} ימים עם פעילות ·
                יום עם הכנסה גבוהה ביותר: {formatCurrency(Math.max(...dailyRevenue.map(d => parseFloat(d.daily_revenue || 0))))}
              </p>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>מדדי לקוחות</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span>לקוחות ייחודיים:</span>
              <strong>{summary.uniqueCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>לקוחות חדשים:</span>
              <strong>{summary.newCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>ממוצע ביקורות:</span>
              <strong>{summary.averageRating}</strong>
            </div>
            <div className={styles.statItem}>
              <span>סה"כ ביקורות:</span>
              <strong>{summary.totalReviews}</strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderYearlyReport = () => {
    const { summary, monthlyBreakdown, topServices, reportYear } = reportData;

    return (
      <>
        <div className={styles.reportHeader}>
          <h2>{business.name}</h2>
          <p className={styles.reportSubtitle}>דוח שנתי - {reportYear}</p>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.totalAppointments}</div>
            <div className={styles.metricLabel}>סה"כ תורים</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{formatCurrency(summary.totalRevenue)}</div>
            <div className={styles.metricLabel}>הכנסות כוללות</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{formatCurrency(summary.averageMonthlyRevenue)}</div>
            <div className={styles.metricLabel}>ממוצע חודשי</div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricValue}>{summary.retentionRate}%</div>
            <div className={styles.metricLabel}>שימור לקוחות</div>
          </div>
        </div>

        {summary.revenueGrowth !== 'N/A' && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>צמיחה שנה-על-שנה</h3>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <span>צמיחה בהכנסות:</span>
                <strong className={parseFloat(summary.revenueGrowth) >= 0 ? styles.positive : styles.negative}>
                  {summary.revenueGrowth}%
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>צמיחה בתורים:</span>
                <strong className={parseFloat(summary.appointmentGrowth) >= 0 ? styles.positive : styles.negative}>
                  {summary.appointmentGrowth}%
                </strong>
              </div>
            </div>
          </div>
        )}

        {topServices && topServices.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>השירותים המובילים</h3>
            <div className={styles.serviceList}>
              {topServices.map((service, index) => (
                <div key={index} className={styles.serviceItem}>
                  <span className={styles.serviceName}>
                    {index + 1}. {service.service_name}
                  </span>
                  <span className={styles.serviceStats}>
                    {service.total_bookings} הזמנות · {formatCurrency(service.service_revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {monthlyBreakdown && monthlyBreakdown.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>פילוח חודשי</h3>
            <div className={styles.monthlyList}>
              {monthlyBreakdown.map((month, index) => (
                <div key={index} className={styles.monthItem}>
                  <span className={styles.monthName}>{month.month}</span>
                  <span className={styles.monthStats}>
                    {month.completed_appointments} תורים · {formatCurrency(month.monthly_revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>מדדי לקוחות</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span>סה"כ לקוחות:</span>
              <strong>{summary.totalCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>לקוחות חוזרים:</span>
              <strong>{summary.returningCustomers}</strong>
            </div>
            <div className={styles.statItem}>
              <span>אחוז שימור:</span>
              <strong>{summary.retentionRate}%</strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>תצוגה מקדימה - דוח {reportType === 'day' ? 'יומי' : reportType === 'month' ? 'חודשי' : 'שנתי'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          {reportType === 'day' && renderDailyReport()}
          {reportType === 'month' && renderMonthlyReport()}
          {reportType === 'year' && renderYearlyReport()}
        </div>

        <div className={styles.modalActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            סגור
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handlePrint}>
            🖨️ הדפס
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onDownload}>
            📄 הורד PDF
          </button>
        </div>
      </div>
    </div>
  );
}
