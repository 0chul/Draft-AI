import React from 'react';
import { Check } from 'lucide-react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.UPLOAD, label: "RFP 분석" },
  { id: AppStep.ANALYSIS, label: "요구사항 확인" },
  { id: AppStep.STRATEGY, label: "전략 수립" },
  { id: AppStep.PREVIEW, label: "제안서 구성" },
  { id: AppStep.COMPLETE, label: "완료" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 px-4 mb-8">
      <div className="flex items-center justify-center w-full">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 z-10 
                    ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                      isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100' : 
                      'bg-white border-gray-300 text-gray-300'}`}
                >
                  {isCompleted ? <Check size={20} strokeWidth={3} /> : <span className="font-bold text-sm">{step.id}</span>}
                </div>
                <div className={`absolute top-12 whitespace-nowrap text-xs font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.label}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-1 mx-2 transition-all duration-300 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};