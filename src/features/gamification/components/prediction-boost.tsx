'use client';

import { toast } from 'sonner';
import { usePredictionBoost } from '../hooks/use-prediction-boost';
import ActivePredictionCard from './active-prediction-card';
import CreatePredictionForm from './create-prediction-form';
import GettingStartedCard from './getting-started-card';
import HowItWorksCard from './how-it-works-card';
import PriceStatsCards from './price-stats-cards';

export default function PredictionBoost() {
  const {
    currentETHPrice,
    activePrediction,
    userMultiplier,
    requiredStake,
    createPrediction,
    resolvePrediction,
    resetMultiplier,
    isCreating,
    isResolving,
    isResetting,
    canResolve,
    ryBondBalance,
  } = usePredictionBoost();

  const handleCreatePrediction = async (
    targetPrice: string,
    isAbove: boolean,
    expiryHours: string,
    tier: 0 | 1 | 2
  ) => {
    if (!targetPrice) {
      toast.error('Please enter a target price');
      return;
    }

    if (Number(targetPrice) <= 0) {
      toast.error('Target price must be greater than 0');
      return;
    }

    const totalHours = Number(expiryHours);
    if (totalHours < 0.5) {
      toast.error('Expiry must be at least 30 minutes');
      return;
    }

    try {
      toast.info('Creating prediction...');
      await createPrediction(targetPrice, isAbove, expiryHours, tier);
      toast.success('Prediction created successfully!');
    } catch (error) {
      console.error('Create prediction failed:', error);
      toast.error('Failed to create prediction');
    }
  };

  const handleResolve = async () => {
    try {
      toast.info('Resolving prediction...');
      await resolvePrediction();
      toast.success('Prediction resolved!');
    } catch (error) {
      console.error('Resolve failed:', error);
      toast.error('Failed to resolve prediction');
    }
  };

  const handleReset = async () => {
    try {
      toast.info('Resetting multiplier...');
      await resetMultiplier();
      toast.success('Multiplier reset to 1.0x');
    } catch (error) {
      console.error('Reset failed:', error);
      toast.error('Failed to reset multiplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Stats Cards */}
      <PriceStatsCards
        currentETHPrice={currentETHPrice}
        userMultiplier={userMultiplier}
        ryBondBalance={ryBondBalance}
      />

      {/* Getting Started Guide (only shows if no ryBOND) */}
      <GettingStartedCard ryBondBalance={ryBondBalance} />

      {/* Create Form (show if no prediction OR prediction is resolved) */}
      {(!activePrediction || activePrediction.resolved) && (
        <CreatePredictionForm
          requiredStake={requiredStake}
          ryBondBalance={ryBondBalance}
          userMultiplier={userMultiplier}
          isCreating={isCreating}
          isResetting={isResetting}
          onCreate={handleCreatePrediction}
          onReset={handleReset}
        />
      )}

      {/* Active Prediction (if exists) */}
      {activePrediction && (
        <ActivePredictionCard
          activePrediction={activePrediction}
          canResolve={canResolve}
          isResolving={isResolving}
          onResolve={handleResolve}
          currentETHPrice={currentETHPrice}
        />
      )}

      {/* How It Works */}
      <HowItWorksCard />
    </div>
  );
}
