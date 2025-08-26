import React from 'react';
import styles from './KpiCards.module.css';

const KpiCard = ({ title, value, icon, color }) => (
  <div className={styles.kpiCard} style={{ borderTop: `4px solid ${color}` }}>
    <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20` }}>
      {icon}
    </div>
    <div className={styles.textWrapper}>
      <div className={styles.value}>{value}</div>
      <div className={styles.title}>{title}</div>
    </div>
  </div>
);

export default function KpiCards({ analytics }) {
  if (!analytics) return null;

  // Provide default values to prevent crash if properties are null/undefined
  const monthlyRevenue = analytics.monthlyRevenue || 0;
  const weeklyRevenue = analytics.weeklyRevenue || 0;
  const pendingAppointments = analytics.pendingAppointments || 0;
  const newClientsThisMonth = analytics.newClientsThisMonth || 0;

  return (
    <div className={styles.kpiGrid}>
      <KpiCard
        title="הכנסה החודש"
        value={`₪${monthlyRevenue.toLocaleString()}`}
        icon="💰"
        color="var(--success-green)"
      />
      <KpiCard
        title="הכנסה השבוע"
        value={`₪${weeklyRevenue.toLocaleString()}`}
        icon="💸"
        color="var(--primary-blue)"
      />
      <KpiCard
        title="תורים ממתינים"
        value={pendingAppointments}
        icon="⏳"
        color="var(--warning-orange)"
      />
      <KpiCard
        title="לקוחות חדשים (חודש)"
        value={newClientsThisMonth}
        icon="👥"
        color="var(--business-purple)"
      />
    </div>
  );
}