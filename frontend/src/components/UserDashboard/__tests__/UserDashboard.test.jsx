import { describe, beforeEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDashboard from '../UserDashboard.jsx';
import axiosInstance from '../../../api/axiosInstance';

vi.mock('../../../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../ProfileModal/ProfileModal', () => ({
  default: ({ isOpen }) => (isOpen ? <div data-testid="profile-modal" /> : null),
}));

vi.mock('../ReviewableAppointments/ReviewableAppointments', () => ({
  default: () => <div data-testid="reviewable-appointments" />,
}));

describe('UserDashboard', () => {
  const mockUser = { id: 1 };

  beforeEach(() => {
    axiosInstance.get.mockReset();
  });

  it('renders loading state while data is being fetched', () => {
    axiosInstance.get.mockResolvedValueOnce({ data: null });

    render(<UserDashboard user={mockUser} />);

    expect(screen.getByText('טוען נתונים...')).toBeInTheDocument();
  });

  it('displays user dashboard data when API responds successfully', async () => {
    const dashboardResponse = {
      user: { firstName: 'דניאל' },
      upcomingAppointments: [
        {
          id: 1,
          date: '2024-04-10T10:00:00Z',
          businessName: 'Salon One',
          serviceName: 'Haircut',
          price: 120,
          status: 'confirmed',
        },
      ],
      pastAppointments: [],
      favorites: [
        { id: 3, name: 'Spa Life', category: 'Spa', address: 'Main St 5', visitCount: 2 },
      ],
      favoriteBusinesses: 1,
    };

    axiosInstance.get.mockResolvedValueOnce({ data: dashboardResponse });

    render(<UserDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('שלום, דניאל')).toBeInTheDocument();
    });

    expect(screen.getByText('Salon One')).toBeInTheDocument();
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('₪120')).toBeInTheDocument();
    expect(screen.getByText('העסקים המועדפים שלי')).toBeInTheDocument();
  });

  it('shows empty state when dashboard returns no appointments', async () => {
    const dashboardResponse = {
      user: { firstName: 'יעל' },
      upcomingAppointments: [],
      pastAppointments: [],
      favorites: [],
      favoriteBusinesses: 0,
    };

    axiosInstance.get.mockResolvedValueOnce({ data: dashboardResponse });

    render(<UserDashboard user={mockUser} />);

    const viewAllButton = await screen.findByRole('button', {
      name: 'הצג את כל התורים (0)',
    });

    fireEvent.click(viewAllButton);

    expect(await screen.findByText('אין תורים')).toBeInTheDocument();
    expect(screen.getByText('עדיין לא קבעת תורים במערכת')).toBeInTheDocument();
  });

  it('shows message when API returns empty payload', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: null });

    render(<UserDashboard user={mockUser} />);

    expect(await screen.findByText('לא נמצאו נתונים')).toBeInTheDocument();
  });
});
