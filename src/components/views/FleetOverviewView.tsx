import React from "react";
import { FleetCounters } from "../FleetCounters";
import { WarehouseMap } from "../WarehouseMap";
import { AmrList } from "../AmrList";
import { RecentEventsPanel } from "../RecentEventsPanel";
import { FleetUtilizationDonut } from "../FleetUtilizationDonut";

export const FleetOverviewView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col space-y-3 p-3 overflow-y-auto bg-[#F6F5FA] text-[#212121] select-none font-['Times_New_Roman',Times,serif]">
      {/* Top Workspace Row: Left 3 Counters, Center 6 Canvas Map, Right 3 AMR Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 shrink-0">
        {/* Left Column: Fleet Counters */}
        <div className="lg:col-span-3 flex flex-col h-[460px]">
          <FleetCounters />
        </div>

        {/* Center: Industrial Warehouse Canvas Map */}
        <div className="lg:col-span-6 h-[460px] flex flex-col">
          <WarehouseMap />
        </div>

        {/* Right Column: Real-time AMR Roster */}
        <div className="lg:col-span-3 h-[460px] flex flex-col">
          <AmrList />
        </div>
      </div>

      {/* Bottom Telemetry Panels Row (Fixed Height 210px with Internal Scrolling) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 h-[210px]">
        {/* Panel 1: Recent Fleet Events Stream */}
        <div className="h-full min-h-0 flex flex-col">
          <RecentEventsPanel />
        </div>

        {/* Panel 2: Fleet Utilization Donut Chart */}
        <div className="h-full min-h-0 flex flex-col">
          <FleetUtilizationDonut />
        </div>
      </div>
    </div>
  );
};
