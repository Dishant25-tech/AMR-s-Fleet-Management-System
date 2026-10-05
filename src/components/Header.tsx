import React, { useState, useEffect } from "react";
import { useFleetStore } from "../store/useFleetStore";
import type { NavTab } from "../store/useFleetStore";
import { Activity, Radio, ShieldCheck, ListOrdered, BarChart2, Cpu, Play, RotateCcw, HelpCircle } from "lucide-react";

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    runDemoMission,
    resetSimulation,
    setMapUploaderOpen,
    setTourOpen,
  } = useFleetStore();

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      const ms = String(Math.floor(d.getMilliseconds() / 100));
      setCurrentTime(`${hh}:${mm}:${ss}.${ms}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Fleet Overview", icon: <Activity className="w-4 h-4 mr-1.5" /> },
    { id: "connectivity", label: "Connectivity", icon: <Radio className="w-4 h-4 mr-1.5" /> },
    { id: "tasks", label: "Mission Control", icon: <ListOrdered className="w-4 h-4 mr-1.5" /> },
    { id: "kpi", label: "Mission KPI", icon: <BarChart2 className="w-4 h-4 mr-1.5" /> },
    { id: "security", label: "Security & Priority", icon: <ShieldCheck className="w-4 h-4 mr-1.5" /> },
  ];

  return (
    <header className="bg-[#FFFFFF] border-b border-[#C3CCDA] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Title Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-[#212121] text-white px-2.5 py-1.5 rounded-[4px] font-bold flex items-center">
          <Radio className="w-4 h-4 mr-2 text-[#CFDECA]" />
          <span className="tracking-wider uppercase text-xs">Central Fleet Management Console</span>
        </div>
        <div className="hidden xl:flex flex-col text-[11px] text-[#5C6269]">
          <span className="font-bold text-[#212121]">Hybrid Decentralized AMR Coordination Console</span>
          <span className="text-[10px] text-[#5C6269] font-mono">
            Peer Mesh Network | Dynamic Rerouting | Packet Integrity
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex space-x-1 bg-[#F6F5FA] p-1 border border-[#C3CCDA] rounded-[4px]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-3 py-1.5 rounded-[4px] transition-colors font-medium text-xs ${
                isActive
                  ? "bg-[#212121] text-white font-bold"
                  : "text-[#212121] hover:bg-[#D8DFE9]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Action Controls & Clock */}
      <div className="flex items-center space-x-2">
        <button
          onClick={runDemoMission}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-[4px] bg-[#212121] hover:bg-[#333333] text-white font-bold text-xs transition-colors cursor-pointer"
          title="Start mock simulation from a clean state"
        >
          <Play className="w-3.5 h-3.5 mr-1" />
          <span>Run Demo Mission</span>
        </button>

        <button
          onClick={resetSimulation}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] border border-[#C3CCDA] bg-[#FFFFFF] hover:bg-[#F6F5FA] text-[#212121] font-semibold text-xs transition-colors cursor-pointer"
          title="Reset simulation to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#5C6269]" />
          <span>Reset</span>
        </button>

        <button
          onClick={() => setMapUploaderOpen(true)}
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-[4px] border border-[#C3CCDA] bg-[#FFFFFF] hover:bg-[#F6F5FA] text-[#212121] font-semibold text-xs transition-colors cursor-pointer"
          title="Open OpenCV Floor-plan Map Generator"
        >
          <Cpu className="w-3.5 h-3.5 text-[#212121]" />
          <span>Map Generator</span>
        </button>

        <button
          onClick={() => {
            setTourOpen(true);
          }}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-[4px] border border-[#C3CCDA] bg-[#FFFFFF] hover:bg-[#F6F5FA] text-[#212121] font-semibold text-xs transition-colors cursor-pointer"
          title="Start Guided System Tour"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#5C6269]" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        <div className="bg-[#F6F5FA] border border-[#C3CCDA] px-2.5 py-1 rounded-[4px] text-[#212121] font-mono tabular-nums text-xs font-bold">
          <span className="text-[#5C6269] text-[9px] block leading-none mb-0.5 uppercase">SYSTEM TIME</span>
          {currentTime || "11:30:00.0"}
        </div>
      </div>
    </header>
  );
};
