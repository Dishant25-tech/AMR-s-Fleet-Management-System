import React, { useState } from "react";
import { useFleetStore } from "../../store/useFleetStore";
import type { TaskKPI } from "../../types/fleet";
import { BarChart2, ArrowUpDown } from "lucide-react";

type SortKey = keyof TaskKPI;

export const MissionKpiView: React.FC = () => {
  const { taskKpis } = useFleetStore();
  const [sortKey, setSortKey] = useState<SortKey>("totalLatency");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = [...taskKpis].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const avgLatency =
    taskKpis.length > 0
      ? (taskKpis.reduce((acc, k) => acc + k.totalLatency, 0) / taskKpis.length).toFixed(1)
      : "0.0";
  const avgTravel =
    taskKpis.length > 0
      ? (taskKpis.reduce((acc, k) => acc + k.activeTravelTime, 0) / taskKpis.length).toFixed(1)
      : "0.0";
  const avgWait =
    taskKpis.length > 0
      ? (taskKpis.reduce((acc, k) => acc + k.idleWaitTime, 0) / taskKpis.length).toFixed(1)
      : "0.0";

  return (
    <div className="flex-1 p-4 bg-[#F6F5FA] text-[#212121] overflow-y-auto space-y-4 select-none">
      {/* Header Summary */}
      <div className="border-b border-[#C3CCDA] pb-2 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-[#212121]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
              Mission KPI Telemetry Report
            </h2>
          </div>
          <p className="text-xs text-[#5C6269]">
            Per-task latency and travel timing benchmarks from assignment to completion.
          </p>
        </div>

        <div className="flex space-x-3 font-mono text-xs">
          <div className="bg-[#FFFFFF] border border-[#C3CCDA] px-3 py-1 rounded-[4px]">
            <span className="text-[#5C6269] text-[10px] block font-sans uppercase">Avg Total Latency</span>
            <span className="font-bold text-[#212121]">{avgLatency}s</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#C3CCDA] px-3 py-1 rounded-[4px]">
            <span className="text-[#5C6269] text-[10px] block font-sans uppercase">Avg Travel Time</span>
            <span className="font-bold text-[#212121]">{avgTravel}s</span>
          </div>
          <div className="bg-[#FFFFFF] border border-[#C3CCDA] px-3 py-1 rounded-[4px]">
            <span className="text-[#5C6269] text-[10px] block font-sans uppercase">Avg Idle Wait</span>
            <span className="font-bold text-[#212121]">{avgWait}s</span>
          </div>
        </div>
      </div>

      {/* Engineering Task KPI Table */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-2">
          Task Performance KPI Matrix ({taskKpis.length} Tasks)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F5FA] text-[#5C6269] font-bold uppercase border-b border-[#C3CCDA]">
              <tr>
                <th
                  onClick={() => handleSort("taskId")}
                  className="p-2.5 cursor-pointer hover:text-[#212121] select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Task ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("robotId")}
                  className="p-2.5 cursor-pointer hover:text-[#212121] select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Robot ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("totalLatency")}
                  className="p-2.5 cursor-pointer hover:text-[#212121] select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Latency (s)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("activeTravelTime")}
                  className="p-2.5 cursor-pointer hover:text-[#212121] select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Active Travel Time (s)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("idleWaitTime")}
                  className="p-2.5 cursor-pointer hover:text-[#212121] select-none"
                >
                  <div className="flex items-center space-x-1">
                    <span>Idle Wait Time (s)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3CCDA] font-mono text-[#212121]">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-[#5C6269] font-sans">
                    No task KPI data recorded yet. Run tasks to populate performance table.
                  </td>
                </tr>
              ) : (
                sortedData.map((row, idx) => (
                  <tr key={`${row.taskId}-${idx}`} className="hover:bg-[#F6F5FA] transition-colors">
                    <td className="p-2.5 font-bold">{row.taskId}</td>
                    <td className="p-2.5 font-bold">{row.robotId}</td>
                    <td className="p-2.5 font-bold">{row.totalLatency}s</td>
                    <td className="p-2.5">{row.activeTravelTime}s</td>
                    <td className="p-2.5">{row.idleWaitTime}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
