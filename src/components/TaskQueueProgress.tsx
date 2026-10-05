import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import { ListChecks } from "lucide-react";

export const TaskQueueProgress: React.FC = () => {
  const { taskQueue } = useFleetStore();

  const categories = ["Pick", "Place", "Charge", "Audit"] as const;

  const categoryStats = categories.map((cat) => {
    const total = taskQueue.filter((t) => t.type === cat).length;
    const completed = taskQueue.filter((t) => t.type === cat && t.status === "complete").length;
    const active = taskQueue.filter((t) => t.type === cat && t.status === "active").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { category: cat, total, completed, active, pct };
  });

  return (
    <div className="bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#e4e8ee]">
          <ListChecks className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase tracking-wider">TASK QUEUE PROGRESS</span>
        </div>
        <span className="text-[10px] font-mono text-[#8b95a5]">SHIFT TARGETS</span>
      </div>

      {/* Category Progress Bars */}
      <div className="flex-1 p-2 space-y-2 flex flex-col justify-center">
        {categoryStats.map((stat) => (
          <div key={stat.category} className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#e4e8ee] font-medium">{stat.category} Tasks</span>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span className="text-emerald-400 font-bold tabular-nums">{stat.completed}</span>
                <span className="text-[#8b95a5]">/</span>
                <span className="text-[#e4e8ee] font-bold tabular-nums">{stat.total}</span>
                <span className="text-[#8b95a5] text-[9px]">({stat.pct}%)</span>
              </div>
            </div>

            {/* Flat Bar Track */}
            <div className="w-full bg-[#0d1117] h-2 rounded-xs border border-[#242c38] overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${stat.pct}%` }}
              ></div>
              <div
                className="bg-amber-600 h-full transition-all duration-300"
                style={{
                  width: `${stat.total > 0 ? (stat.active / stat.total) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
