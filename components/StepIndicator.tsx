import React from 'react';
import { AppStep } from '../types';
import { CheckCircle2, FileEdit, Sparkles } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.SETUP, label: 'Thiết lập & Cấu hình', icon: FileEdit },
    { id: AppStep.GENERATING, label: 'Đang tạo', icon: Sparkles },
    { id: AppStep.RESULT, label: 'Kết quả', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepId: AppStep) => {
    const stepOrder = [AppStep.SETUP, AppStep.GENERATING, AppStep.RESULT];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : status === 'current'
                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  status === 'current' ? 'text-primary-700' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};