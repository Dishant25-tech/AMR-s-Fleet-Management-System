import React, { useEffect } from "react";
import { useFleetStore } from "./store/useFleetStore";
import { simulationEngine } from "./simulation/mockEngine";
import { Header } from "./components/Header";
import { FleetOverviewView } from "./components/views/FleetOverviewView";
import { ConnectivityView } from "./components/views/ConnectivityView";
import { TaskQueueView } from "./components/views/TaskQueueView";
import { MissionKpiView } from "./components/views/MissionKpiView";
import { SecurityPriorityView } from "./components/views/SecurityPriorityView";
import { AmrDetailModal } from "./components/AmrDetailModal";
import { RegisterAmrModal } from "./components/RegisterAmrModal";
import { MapUploaderModal } from "./components/MapUploaderModal";
import { OnboardingTour } from "./components/OnboardingTour";

export const App: React.FC = () => {
  const { activeTab, setTourOpen } = useFleetStore();

  useEffect(() => {
    // Start mock simulation engine on app mount
    simulationEngine.start();

    // Trigger onboarding tour on initial load if not previously seen
    const hasSeenTour = localStorage.getItem("hasSeenFleetTour_v2");
    if (!hasSeenTour) {
      setTourOpen(true);
      localStorage.setItem("hasSeenFleetTour_v2", "true");
    }

    return () => {
      simulationEngine.stop();
    };
  }, [setTourOpen]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F6F5FA] text-[#212121] overflow-hidden select-none font-serif">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Screen Content Area (5 Views) */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === "overview" && <FleetOverviewView />}
        {activeTab === "connectivity" && <ConnectivityView />}
        {activeTab === "tasks" && <TaskQueueView />}
        {activeTab === "kpi" && <MissionKpiView />}
        {activeTab === "security" && <SecurityPriorityView />}
      </main>

      {/* AMR Detail Modal */}
      <AmrDetailModal />

      {/* Register New AMR Modal */}
      <RegisterAmrModal />

      {/* OpenCV Warehouse Map Generator Modal */}
      <MapUploaderModal />

      {/* Guided Onboarding Tour */}
      <OnboardingTour />
    </div>
  );
};

export default App;
