'use client';

import { motion } from 'framer-motion';
import { RiStarFill, RiLightbulbLine, RiArrowRightLine } from '@remixicon/react';
import { Badge } from '@/components/landing/Badge';
import { Button } from '@/components/landing/Button';
import { TierRecommendation, BusinessTier } from '@/types/pricing';
import { getTierDisplayName } from '@/lib/config/pricing-config';
import { useState, useEffect } from 'react';

interface RecommendationBannerProps {
  recommendation: TierRecommendation;
  onSelectPlan: (tier: BusinessTier) => void;
  className?: string;
}

export function RecommendationBanner({ 
  recommendation, 
  onSelectPlan, 
  className = '' 
}: RecommendationBannerProps) {
  const { recommendedTier, confidence, reasoning, alternatives } = recommendation;
  const tierDisplayName = getTierDisplayName(recommendedTier);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 lg:p-8 text-white ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90" />
      <div className="absolute -top-4 -right-4 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white/5" />
      
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <RiLightbulbLine className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
            <Badge className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
              AI Recommendation
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <RiStarFill className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
            <span className="font-medium">{confidence}% match</span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
          We recommend the {tierDisplayName} plan for you
        </h3>

        <div className={`grid gap-4 sm:gap-6 mt-4 sm:mt-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          <div>
            <h4 className="font-semibold mb-2 sm:mb-3 text-white/90 text-sm sm:text-base">Why this plan fits:</h4>
            <ul className="space-y-1 sm:space-y-2">
              {reasoning.map((reason, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-2 text-xs sm:text-sm text-white/90"
                >
                  <RiArrowRightLine className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-yellow-300" />
                  <span className="leading-relaxed">{reason}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <Button
                onClick={() => onSelectPlan(recommendedTier)}
                className="w-full bg-white text-indigo-600 hover:bg-white/90 font-semibold mb-3 sm:mb-4 text-sm sm:text-base py-2 sm:py-3"
              >
                Choose {tierDisplayName} Plan
              </Button>
              
              {alternatives.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-white/90 text-xs sm:text-sm">
                    Other options:
                  </h4>
                  <div className="space-y-2">
                    {alternatives.slice(0, isMobile ? 2 : alternatives.length).map((alt, index) => (
                      <motion.div
                        key={alt.tier}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex items-center justify-between text-xs sm:text-sm"
                      >
                        <div className="flex-1">
                          <button
                            onClick={() => onSelectPlan(alt.tier)}
                            className="text-white/90 hover:text-white underline underline-offset-2 text-left"
                          >
                            {getTierDisplayName(alt.tier)}
                          </button>
                          <p className="text-xs text-white/70 mt-0.5">{alt.reason}</p>
                        </div>
                        {alt.savings && (
                          <Badge className="bg-green-500/20 text-green-200 border-green-400/30 text-xs ml-2">
                            Save ${alt.savings}/mo
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                    {isMobile && alternatives.length > 2 && (
                      <p className="text-xs text-white/70 text-center">
                        +{alternatives.length - 2} more options available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}