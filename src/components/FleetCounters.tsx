import React from "react";
import { useFleetStore } from "../store/useFleetStore";

export const FleetCounters: React.FC = () => {
  const { amrs, taskQueue } = useFleetStore();

  const totalAMRs = amrs.length;
  const activeTasks = taskQueue.filter((t) => t.status === "active").length;
  const completedTasks = taskQueue.filter((t) => t.status === "complete").length;
  const pendingTasks = taskQueue.filter((t) => t.status === "queued").length;

  const pickCount = taskQueue.filter((t) => t.type === "Pick").length;
  const placeCount = taskQueue.filter((t) => t.type === "Place").length;
  const auditCount = taskQueue.filter((t) => t.type === "Audit").length;
  const chargeCount = taskQueue.filter((t) => t.type === "Charge").length;

  return (
    <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-3 text-[#212121] flex flex-col space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-1.5">
        Fleet Telemetry Summary
      </h3>

      {/* 4 Fleet Counters */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px]">
          <span className="text-[10px] text-[#5C6269] uppercase font-semibold block">Total AMRs</span>
          <span className="text-base font-bold text-[#212121] tabular-nums">{totalAMRs}</span>
        </div>

        <div className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px]">
          <span className="text-[10px] text-[#5C6269] uppercase font-semibold block">Active Tasks</span>
          <span className="text-base font-bold text-[#212121] tabular-nums">{activeTasks}</span>
        </div>

        <div className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px]">
          <span className="text-[10px] text-[#5C6269] uppercase font-semibold block">Completed Tasks</span>
          <span className="text-base font-bold text-[#212121] tabular-nums">{completedTasks}</span>
        </div>

        <div className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px]">
          <span className="text-[10px] text-[#5C6269] uppercase font-semibold block">Pending Tasks</span>
          <span className="text-base font-bold text-[#212121] tabular-nums">{pendingTasks}</span>
        </div>
      </div>

      {/* Compact Task Category Breakdown */}
      <div className="border-t border-[#C3CCDA] pt-2">
        <span className="text-[10px] font-bold text-[#5C6269] uppercase block mb-1.5">
          Task Category Breakdown
        </span>
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center">
          <div className="bg-[#D8DFE9] p-1 rounded-[4px]">
            <span className="block text-[9px] text-[#5C6269] font-sans">Pick</span>
            <span className="font-bold text-[#212121]">{pickCount}</span>
          </div>
          <div className="bg-[#D8DFE9] p-1 rounded-[4px]">
            <span className="block text-[9px] text-[#5C6269] font-sans">Place</span>
            <span className="font-bold text-[#212121]">{placeCount}</span>
          </div>
          <div className="bg-[#D8DFE9] p-1 rounded-[4px]">
            <span className="block text-[9px] text-[#5C6269] font-sans">Audit</span>
            <span className="font-bold text-[#212121]">{auditCount}</span>
          </div>
          <div className="bg-[#D8DFE9] p-1 rounded-[4px]">
            <span className="block text-[9px] text-[#5C6269] font-sans">Charge</span>
            <span className="font-bold text-[#212121]">{chargeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
