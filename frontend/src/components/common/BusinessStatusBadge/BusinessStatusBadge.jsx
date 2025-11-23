import React from 'react';
import PropTypes from 'prop-types';
import { parseSchedule, getCurrentStatus } from '../../../utils/scheduleUtils';
import styles from './BusinessStatusBadge.module.css';

/**
 * Business Status Badge Component
 * Shows if a business is currently open or closed based on working hours
 *
 * @param {Object} props
 * @param {string|object} props.workingHours - Working hours from business object
 * @param {string} props.size - Badge size: 'small', 'medium', 'large'
 * @param {boolean} props.showNextOpening - Show next opening time when closed
 * @returns {JSX.Element}
 */
const BusinessStatusBadge = ({ workingHours, size = 'medium', showNextOpening = false }) => {
  if (!workingHours) {
    return null;
  }

  const schedule = parseSchedule(workingHours);
  const status = getCurrentStatus(schedule);

  return (
    <div className={styles.badgeContainer}>
      <div
        className={`
          ${styles.badge}
          ${status.isOpen ? styles.open : styles.closed}
          ${styles[size]}
        `}
      >
        <span className={styles.dot}></span>
        <span className={styles.text}>
          {status.isOpen ? 'פתוח עכשיו' : 'סגור'}
        </span>
      </div>

      {!status.isOpen && showNextOpening && status.nextOpenDay && (
        <div className={styles.nextOpening}>
          פתיחה: {status.nextOpenDay}
        </div>
      )}
    </div>
  );
};

BusinessStatusBadge.propTypes = {
  workingHours: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showNextOpening: PropTypes.bool
};

export default BusinessStatusBadge;
