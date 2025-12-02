
import React from 'react';
import { Check } from 'lucide-react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.UPLOAD, label: "RFP 분석" },
  { id: AppStep.ANALYSIS, label: "요구사항 확인" },
  { id: AppStep.RESEARCH, label: "시장 분석" },
  { id: AppStep.STRATEGY, label: "전략 수립" },
  { id: AppStep.MATCHING, label: "강사 매칭" },
  { id: AppStep.PREVIEW, label: "제안서 구성" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-4 mb-8">
      {/* Container with overflow handling for smaller screens */}
      <div className="flex w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex min-w-max w-full">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isLast = index === steps.length - 1;
            
            // Colors
            let bgClass = 'bg-slate-200';
            let textClass = 'text-slate-500';
            
            if (isCompleted) {
              bgClass = 'bg-slate-700';
              textClass = 'text-slate-100';
            } else if (isCurrent) {
              bgClass = 'bg-blue-600';
              textClass = 'text-white font-bold';
            }

            // Clip Path Logic
            // Arrow depth in pixels
            const arrowDepth = 20;
            
            // We use inline styles for clip-path because Tailwind arbitrary values can be complex with calcs
            let clipPathStyle = {};
            
            if (index === 0) {
              // First item: Flat left, Arrow right
              clipPathStyle = {
                clipPath: `polygon(0% 0%, calc(100% - ${arrowDepth}px) 0%, 100% 50%, calc(100% - ${arrowDepth}px) 100%, 0% 100%)`
              };
            } else if (isLast) {
              // Last item: Cutout left, Flat right
              clipPathStyle = {
                 clipPath: `polygon(${arrowDepth}px 0%, 100% 0%, 100% 100%, ${arrowDepth}px 100%, 0% 50%)`
              };
            } else {
              // Middle items: Cutout left, Arrow right
              clipPathStyle = {
                clipPath: `polygon(${arrowDepth}px 0%, calc(100% - ${arrowDepth}px) 0%, 100% 50%, calc(100% - ${arrowDepth}px) 100%, ${arrowDepth}px 100%, 0% 50%)`
              };
            }

            return (
              <div 
                key={step.id} 
                className={`relative flex-1 h-14 flex items-center justify-center px-8 transition-colors duration-300 ${bgClass} ${textClass}`}
                style={{
                  ...clipPathStyle,
                  // Negative margin to pull items together so the arrow point fits into the cutout
                  marginLeft: index === 0 ? 0 : `-${arrowDepth}px`,
                  // Ensure correct stacking order if needed (though clip-path usually handles visuals fine without z-index tricks if opaque)
                  zIndex: steps.length - index
                }}
              >
                <div className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                  {isCompleted ? (
                    <div className="w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center text-white">
                        <Check size={12} strokeWidth={3} />
                    </div>
                  ) : (
                    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold border ${isCurrent ? 'border-white/50 bg-white/20' : 'border-slate-400 text-slate-400'}`}>
                      {step.id}
                    </span>
                  )}
                  <span className={isCurrent ? 'font-bold' : 'font-medium'}>{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
