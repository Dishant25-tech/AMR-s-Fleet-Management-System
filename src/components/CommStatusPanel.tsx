import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import { Server, Radio, Layers } from "lucide-react";

export const CommStatusPanel: React.FC = () => {
  const { amrs, taskQueue } = useFleetStore();

  const centralCount = amrs.filter((a) => a.commMode === "central").length;
  const meshCount = amrs.filter((a) => a.commMode === "mesh").length;
  const isolatedCount = amrs.filter((a) => a.commMode === "isolated").length;

  const categoryCounts = {
    Pick: taskQueue.filter((t) => t.type === "Pick").length,
    Place: taskQueue.filter((t) => t.type === "Place").length,
    Charge: taskQueue.filter((t) => t.type === "Charge").length,
    Audit: taskQueue.filter((t) => t.type === "Audit").length,
  };
  const totalTasks = taskQueue.length || 1;

  return (
    <div className="bg-[#141a24] border border-[#242c38] p-2.5 rounded-sm flex flex-col space-y-2 select-none text-[#e4e8ee] h-full overflow-y-auto">
      <div>
        <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#e4e8ee]">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>CENTRAL SERVER LINK</span>
          </div>
          <span className="text-[10px] bg-emerald-950/80 border border-emerald-700 text-emerald-400 px-1.5 py-0.5 rounded-sm">
            REAL-TIME OK
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] text-[#9ca3af]">
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">NODES</span>
            <span className="text-[#f3f4f6] font-bold tabular-nums">{centralCount} AMRs</span>
          </div>
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">LATENCY</span>
            <span className="text-emerald-400 font-bold tabular-nums">4 ms</span>
          </div>
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">LINK STATE</span>
            <span className="text-[#f3f4f6] font-bold">CONNECTED</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#e4e8ee]">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>PEER MESH NETWORK</span>
          </div>
          <span className="text-[10px] bg-amber-950/80 border border-amber-700 text-amber-400 px-1.5 py-0.5 rounded-sm">
            P2P ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[10px] text-[#9ca3af]">
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">PEER NODES</span>
            <span className="text-amber-400 font-bold tabular-nums">{meshCount + isolatedCount} AMRs</span>
          </div>
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">RSSI</span>
            <span className="text-[#f3f4f6] font-bold tabular-nums">-64 dBm</span>
          </div>
          <div className="bg-[#1b2230] p-1 rounded-sm border border-[#242c38]">
            <span className="text-[9px] block text-[#9ca3af]">ISOLATED</span>
            <span className={isolatedCount > 0 ? "text-red-400 font-bold tabular-nums" : "text-[#9ca3af] font-bold tabular-nums"}>
              {isolatedCount}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#e4e8ee]">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>TASK CATEGORY BREAKDOWN</span>
          </div>
          <span className="text-[10px] text-[#9ca3af] tabular-nums">TOTAL: {taskQueue.length}</span>
        </div>
        <div className="space-y-1 text-[10px]">
          {(["Pick", "Place", "Charge", "Audit"] as const).map((cat) => {
            const count = categoryCounts[cat];
            const pct = Math.round((count / totalTasks) * 100);
            return (
              <div key={cat} className="flex items-center justify-between bg-[#1b2230] px-2 py-0.5 rounded-sm border border-[#242c38]">
                <span className="text-[#f3f4f6] font-medium">{cat}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[#9ca3af] text-[10px] tabular-nums">{pct}%</span>
                  <span className="text-amber-400 font-bold tabular-nums w-4 text-right">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
