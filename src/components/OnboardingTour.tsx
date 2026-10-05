import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import { X, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  targetTab?: "overview" | "connectivity" | "tasks" | "kpi" | "security";
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "1. Central Console Header & Controls",
    description: "Monitors global fleet state and provides primary controls for running and resetting demo missions.",
    targetTab: "overview",
  },
  {
    title: "2. Warehouse Grid & Dead Zone Map",
    description: "Visualizes AMR positions, aisle routes, and the dead zone polygon with peer mesh network fallback.",
    targetTab: "overview",
  },
  {
    title: "3. AMR Telemetry Roster & Trust Badges",
    description: "Lists active AMRs with battery levels, comm mode badges, and packet integrity trust locks. Click any AMR to view full telemetry.",
    targetTab: "overview",
  },
  {
    title: "4. Connectivity View",
    description: "Tracks central server link stability versus local peer mesh network communication per AMR.",
    targetTab: "connectivity",
  },
  {
    title: "5. Mission Control (Injector & Queue)",
    description: "Allows dispatching tasks to specific racks and displays real-time task queue status.",
    targetTab: "tasks",
  },
  {
    title: "6. Mission KPI Table",
    description: "Displays per-task metrics including total latency, active travel time, and idle wait time.",
    targetTab: "kpi",
  },
  {
    title: "7. Security & Priority Analytics",
    description: "Inspects peer packet integrity verification and visualizes deadlock priority aging matrices.",
    targetTab: "security",
  },
];

export const OnboardingTour: React.FC = () => {
  const { isTourOpen, tourStep, setTourOpen, setTourStep, setActiveTab } = useFleetStore();

  if (!isTourOpen) return null;

  const currentStepIndex = Math.max(0, Math.min(tourStep - 1, TOUR_STEPS.length - 1));
  const step = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextStep = currentStepIndex + 2;
      setTourStep(nextStep);
      const nextTarget = TOUR_STEPS[currentStepIndex + 1]?.targetTab;
      if (nextTarget) setActiveTab(nextTarget);
    } else {
      setTourOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = currentStepIndex;
      setTourStep(prevStep);
      const prevTarget = TOUR_STEPS[currentStepIndex - 1]?.targetTab;
      if (prevTarget) setActiveTab(prevTarget);
    }
  };

  const handleSkip = () => {
    setTourOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#212121]/40 backdrop-none p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-5 text-[#212121] shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C3CCDA] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#212121]" />
            <h3 className="font-bold text-sm tracking-wide text-[#212121] uppercase">System Tour</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#5C6269] hover:text-[#212121] transition-colors p-1"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 min-h-[70px]">
          <h4 className="font-bold text-sm mb-1.5 text-[#212121]">{step.title}</h4>
          <p className="text-xs text-[#5C6269] leading-relaxed">{step.description}</p>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-[#C3CCDA] pt-3 text-xs">
          <span className="font-mono text-xs font-semibold text-[#5C6269]">
            {tourStep} of {TOUR_STEPS.length}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 rounded-[4px] border border-[#C3CCDA] text-[#5C6269] hover:text-[#212121] hover:bg-[#F6F5FA] font-medium text-xs transition-colors"
            >
              Skip
            </button>

            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center px-2.5 py-1 rounded-[4px] border border-[#C3CCDA] text-[#212121] hover:bg-[#F6F5FA] font-medium text-xs transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Previous
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center px-3 py-1 rounded-[4px] bg-[#212121] hover:bg-[#333333] text-white font-bold text-xs transition-colors"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}</span>
              {currentStepIndex < TOUR_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
