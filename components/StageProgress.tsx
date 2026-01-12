import React from 'react';
import { ProcessingStage } from '../types';
import { Check, Circle } from 'lucide-react';

interface StageProgressProps {
  stage: ProcessingStage;
}

const StageProgress: React.FC<StageProgressProps> = ({ stage }) => {
  const steps = [
    { id: ProcessingStage.STAGE_1, label: 'Struct' },
    { id: ProcessingStage.STAGE_2, label: 'Simplify' },
    { id: ProcessingStage.STAGE_3, label: 'Mnemonic' },
  ];

  const getStatus = (stepId: ProcessingStage) => {
    // Current step
    if (stage === stepId) return 'current';
    
    // Check if passed
    const order = [
      ProcessingStage.IDLE, 
      ProcessingStage.STAGE_1, 
      ProcessingStage.STAGE_2, 
      ProcessingStage.STAGE_3, 
      ProcessingStage.COMPLETED
    ];
    
    const currentIndex = order.indexOf(stage);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex > stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-neutral-800 -z-10"></div>
        
        {steps.map((step) => {
          const status = getStatus(step.id);
          
          let circleClass = "bg-neutral-950 border-neutral-800 text-neutral-600";
          let labelClass = "text-neutral-600 font-normal";
          let icon = <div className="w-2 h-2 rounded-full bg-neutral-800" />;

          if (status === 'completed') {
            circleClass = "bg-white border-white text-black";
            labelClass = "text-white font-medium";
            icon = <Check className="w-3 h-3" strokeWidth={4} />;
          } else if (status === 'current') {
            circleClass = "bg-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] text-white";
            labelClass = "text-white font-medium";
            icon = <div className="w-2 h-2 rounded-full bg-white animate-pulse" />;
          }

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-black px-4">
               <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${circleClass}`}>
                 {icon}
               </div>
               <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${labelClass}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageProgress;