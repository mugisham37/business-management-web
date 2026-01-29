import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UpgradePromptModal } from '../upgrade-prompt-modal';
import { BusinessTier } from '@/hooks/useTierAccess';

describe('UpgradePromptModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpgradeSuccess = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnUpgradeSuccess.mockClear();
  });

  it('renders correctly when open', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    expect(screen.getByText('Upgrade to Growth Plan')).toBeInTheDocument();
    expect(screen.getByText('Current Plan')).toBeInTheDocument();
    expect(screen.getByText('Upgrade To')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <UpgradePromptModal
        isOpen={false}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    expect(screen.queryByText('Upgrade to Growth Plan')).not.toBeInTheDocument();
  });

  it('displays correct pricing for monthly billing', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    expect(screen.getByText('$0/mo')).toBeInTheDocument(); // Current tier
    expect(screen.getByText('$29/mo')).toBeInTheDocument(); // Target tier
  });

  it('switches to yearly billing and shows savings', async () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    const yearlyButton = screen.getByText('Yearly');
    fireEvent.click(yearlyButton);

    await waitFor(() => {
      expect(screen.getByText(/Save \d+%/)).toBeInTheDocument();
    });
  });

  it('shows feature name when provided', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
        featureName="Advanced Analytics"
      />
    );

    expect(screen.getByText(/Unlock Advanced Analytics/)).toBeInTheDocument();
  });

  it('handles upgrade process correctly', async () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    const upgradeButton = screen.getByText('Upgrade Now');
    fireEvent.click(upgradeButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Upgrading...')).toBeInTheDocument();
    });

    // Should call success callback after upgrade
    await waitFor(() => {
      expect(mockOnUpgradeSuccess).toHaveBeenCalledWith(BusinessTier.SMALL);
    }, { timeout: 3000 });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays trust indicators', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    expect(screen.getByText('Secure payment')).toBeInTheDocument();
    expect(screen.getByText('24/7 support')).toBeInTheDocument();
    expect(screen.getByText('No setup fees')).toBeInTheDocument();
  });

  it('shows new features that will be unlocked', () => {
    render(
      <UpgradePromptModal
        isOpen={true}
        onClose={mockOnClose}
        currentTier={BusinessTier.MICRO}
        targetTier={BusinessTier.SMALL}
        onUpgradeSuccess={mockOnUpgradeSuccess}
      />
    );

    expect(screen.getByText("What you'll unlock")).toBeInTheDocument();
    // Check that the unlock section exists and has content
    const unlockSection = screen.getByText("What you'll unlock").closest('div');
    expect(unlockSection).toBeInTheDocument();
  });
});