import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { TierAwareSidebar } from '../tier-aware-sidebar';
import { BusinessTier } from '@/hooks/useTierAccess';

// Mock the hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}));

jest.mock('@/hooks/useTierAccess', () => ({
  useTierAccess: () => ({
    tierMeetsRequirement: jest.fn((currentTier: BusinessTier, requiredTier: BusinessTier) => {
      const tierLevels: Record<BusinessTier, number> = {
        [BusinessTier.MICRO]: 0,
        [BusinessTier.SMALL]: 1,
        [BusinessTier.MEDIUM]: 2,
        [BusinessTier.ENTERPRISE]: 3,
      };
      return tierLevels[currentTier] >= tierLevels[requiredTier];
    }),
    getTierInfo: jest.fn(),
  }),
  BusinessTier,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('TierAwareSidebar', () => {
  const mockOnUpgradeClick = jest.fn();

  beforeEach(() => {
    mockOnUpgradeClick.mockClear();
  });

  it('renders correctly with MICRO tier', () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Business Manager')).toBeInTheDocument();
    expect(screen.getByText('Free Plan')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows appropriate navigation items for SMALL tier', () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.SMALL}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Growth Plan')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
  });

  it('shows locked features toggle button', () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Show locked features')).toBeInTheDocument();
  });

  it('calls onUpgradeClick when locked feature is clicked', async () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    // First show locked features
    fireEvent.click(screen.getByText('Show locked features'));
    
    await waitFor(() => {
      expect(screen.getByText('Hide locked features')).toBeInTheDocument();
    });

    // Find and click a locked feature (Analytics requires SMALL tier)
    const lockedFeatures = screen.getAllByText('Growth');
    if (lockedFeatures.length > 0 && lockedFeatures[0]) {
      fireEvent.click(lockedFeatures[0]);
      expect(mockOnUpgradeClick).toHaveBeenCalledWith(BusinessTier.SMALL);
    }
  });

  it('displays core features badge correctly', () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    // Dashboard and POS should have "Core" badges
    const coreBadges = screen.getAllByText('Core');
    expect(coreBadges.length).toBeGreaterThan(0);
  });

  it('shows upgrade plan option in user dropdown', async () => {
    render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    // Click on user dropdown
    const userButton = screen.getByText('Test');
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Upgrade Plan'));
    expect(mockOnUpgradeClick).toHaveBeenCalledWith(BusinessTier.SMALL);
  });

  it('renders different tier colors correctly', () => {
    const { rerender } = render(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.MICRO}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Free Plan')).toBeInTheDocument();

    rerender(
      <MockedProvider>
        <TierAwareSidebar 
          currentTier={BusinessTier.ENTERPRISE}
          onUpgradeClick={mockOnUpgradeClick}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Industry Plan')).toBeInTheDocument();
  });
});