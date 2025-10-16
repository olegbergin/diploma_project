import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminStats from '../AdminStats.jsx';
import axiosInstance from '../../../api/axiosInstance';

vi.mock('../../../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AdminStats', () => {
  beforeEach(() => {
    axiosInstance.get.mockReset();
  });

  it('shows loading spinner while statistics are being fetched', () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    render(<AdminStats />);

    expect(screen.getByText('טוען סטטיסטיקות...')).toBeInTheDocument();
  });

  it('renders statistics cards and recent activity data', async () => {
    const statsResponse = {
      monthlyNewUsers: 2500,
      weeklyNewUsers: 120,
      monthlyNewBusinesses: 75,
      weeklyNewBusinesses: 8,
      pendingReviewDeletions: 3,
      pendingApprovals: 6,
      systemStatus: 'operational',
    };

    const activityResponse = [
      {
        id: 1,
        type: 'user_registration',
        message: 'משתמש חדש נרשם',
        timestamp: '2024-04-10T10:00:00Z',
      },
    ];

    axiosInstance.get
      .mockResolvedValueOnce({ data: statsResponse })
      .mockResolvedValueOnce({ data: activityResponse });

    render(<AdminStats />);

    await waitFor(() => {
      expect(screen.getByText('סטטיסטיקות המערכת')).toBeInTheDocument();
    });

    expect(screen.getByText('משתמשים חדשים החודש')).toBeInTheDocument();
    expect(screen.getByText(/2,500/)).toBeInTheDocument();
    expect(screen.getByText('משתמש חדש נרשם')).toBeInTheDocument();
  });

  it('handles empty activity list gracefully', async () => {
    const statsResponse = {
      monthlyNewUsers: 0,
      weeklyNewUsers: 0,
      monthlyNewBusinesses: 0,
      weeklyNewBusinesses: 0,
      pendingReviewDeletions: 0,
      pendingApprovals: 0,
      systemStatus: 'degraded',
    };

    axiosInstance.get
      .mockResolvedValueOnce({ data: statsResponse })
      .mockResolvedValueOnce({ data: [] });

    render(<AdminStats />);

    expect(await screen.findByText('אין פעילות אחרונה')).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });
});
