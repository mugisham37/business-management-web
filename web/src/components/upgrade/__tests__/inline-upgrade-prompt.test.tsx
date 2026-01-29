import { render, screen, fireEvent } from '@testing-library/react';
import { InlineUpgradePrompt, LockedFeatureWrapper } from '../inline-upgrade-prompt';
import { BusinessTier } from '@/hooks/useTierAccess';

describe('InlineUpgradePrompt', () => {
  const mockOnUpgradeClick = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnUpgradeClick.mockClear();
    mockOnDismiss.mockClear();
  });

  it('renders card variant correctly', () => {
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        variant="card"
      />
    );

    expect(screen.getByText('Advanced Analytics is locked')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Growth')).toBeInTheDocument();
  });

  it('renders banner variant correctly', () => {
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        variant="banner"
      />
    );

    expect(screen.getByText('Advanced Analytics requires Growth plan')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('renders compact variant correctly', () => {
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        variant="compact"
      />
    );

    expect(screen.getByText('Requires Growth')).toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('calls onUpgradeClick when upgrade button is clicked', () => {
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        variant="card"
      />
    );

    const upgradeButton = screen.getByText('Upgrade to Growth');
    fireEvent.click(upgradeButton);

    expect(mockOnUpgradeClick).toHaveBeenCalledWith(BusinessTier.SMALL);
  });

  it('shows dismiss button when showDismiss is true', () => {
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        onDismiss={mockOnDismiss}
        showDismiss={true}
        variant="banner"
      />
    );

    const dismissButton = screen.getByRole('button', { name: '×' });
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('displays custom description when provided', () => {
    const customDescription = "This feature helps you analyze customer behavior";
    
    render(
      <InlineUpgradePrompt
        requiredTier={BusinessTier.SMALL}
        featureName="Advanced Analytics"
        description={customDescription}
        onUpgradeClick={mockOnUpgradeClick}
        variant="card"
      />
    );

    expect(screen.getByText(customDescription)).toBeInTheDocument();
  });
});

describe('LockedFeatureWrapper', () => {
  const mockOnUpgradeClick = jest.fn();

  beforeEach(() => {
    mockOnUpgradeClick.mockClear();
  });

  it('renders children when user has access', () => {
    render(
      <LockedFeatureWrapper
        requiredTier={BusinessTier.SMALL}
        currentTier={BusinessTier.MEDIUM} // Higher tier, should have access
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
      >
        <div>Protected Content</div>
      </LockedFeatureWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Analytics is locked')).not.toBeInTheDocument();
  });

  it('renders upgrade prompt when user lacks access', () => {
    render(
      <LockedFeatureWrapper
        requiredTier={BusinessTier.MEDIUM}
        currentTier={BusinessTier.MICRO} // Lower tier, should not have access
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
      >
        <div>Protected Content</div>
      </LockedFeatureWrapper>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Advanced Analytics is locked')).toBeInTheDocument();
  });

  it('uses correct fallback variant', () => {
    render(
      <LockedFeatureWrapper
        requiredTier={BusinessTier.MEDIUM}
        currentTier={BusinessTier.MICRO}
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
        fallbackVariant="compact"
      >
        <div>Protected Content</div>
      </LockedFeatureWrapper>
    );

    expect(screen.getByText('Requires Business')).toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('handles edge case where tiers are equal', () => {
    render(
      <LockedFeatureWrapper
        requiredTier={BusinessTier.SMALL}
        currentTier={BusinessTier.SMALL} // Same tier, should have access
        featureName="Advanced Analytics"
        onUpgradeClick={mockOnUpgradeClick}
      >
        <div>Protected Content</div>
      </LockedFeatureWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Analytics is locked')).not.toBeInTheDocument();
  });
});