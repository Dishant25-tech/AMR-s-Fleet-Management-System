import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import { PieChart, Activity, Zap, ShieldCheck, Gauge } from "lucide-react";

export const FleetUtilizationDonut: React.FC = () => {
  const { amrs } = useFleetStore();

  const moving = amrs.filter((a) => a.statusState === "Moving").length;
  const taskExec = amrs.filter((a) => a.statusState === "Task Execution").length;
  const charging = amrs.filter((a) => a.statusState === "Charging").length;
  const yielding = amrs.filter((a) => a.statusState === "Yielding" || (a.haltReason && a.haltReason !== null)).length;
  const idle = amrs.filter((a) => a.statusState === "Idle").length;

  const total = amrs.length || 1;
  const avgBattery = Math.round(amrs.reduce((acc, a) => acc + a.battery, 0) / total);
  const activeCount = moving + taskExec;
  const utilizationPct = Math.round((activeCount / total) * 100);

  const categories = [
    { name: "Active Travel", count: moving, color: "#95C292" },
    { name: "Task Execution", count: taskExec, color: "#76A6DC" },
    { name: "Charging Bay", count: charging, color: "#EED868" },
    { name: "Junction Yield", count: yielding, color: "#EBA398" },
    { name: "Idle Staging", count: idle, color: "#C0C6D0" },
  ];

  // SVG Donut slice calculation
  let cumulativeAngle = 0;
  const slices = categories.map((cat) => {
    const value = cat.count;
    const percentage = value / total;
    const angle = percentage * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...cat, value, percentage, startAngle, angle };
  });

  return (
    <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] flex flex-col h-full overflow-hidden select-none font-['Times_New_Roman',Times,serif]">
      {/* Header */}
      <div className="bg-[#F6F5FA] border-b border-[#C3CCDA] px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#212121]">
          <PieChart className="w-3.5 h-3.5 text-[#212121]" />
          <span className="uppercase tracking-wider">Fleet Utilization & Telemetry Analytics</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#CFDECA] text-[#212121]">
            <Activity className="w-3 h-3 mr-1" /> {utilizationPct}% Active Fleet Rate
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 grid grid-cols-12 gap-3 items-center">
        {/* Left Section: Crisp Custom SVG Donut Chart */}
        <div className="col-span-4 flex flex-col items-center justify-center border-r border-[#C3CCDA] pr-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {slices.map((slice, i) => {
                if (slice.percentage === 0) return null;
                if (slice.percentage >= 0.999) {
                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="36"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="18"
                    />
                  );
                }
                const r = 36;
                const circumference = 2 * Math.PI * r;
                const strokeDasharray = `${(slice.angle / 360) * circumference} ${circumference}`;
                const strokeDashoffset = -((slice.startAngle / 360) * circumference);

                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="18"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-base font-bold text-[#212121] leading-none">{amrs.length}</span>
              <span className="text-[9px] text-[#5C6269] uppercase font-bold mt-0.5">AMR Fleet</span>
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] text-[#5C6269] font-bold uppercase">
            Live Status Distribution
          </div>
        </div>

        {/* Center Section: Status Legend & Breakdown */}
        <div className="col-span-4 space-y-1.5 border-r border-[#C3CCDA] px-2">
          {categories.map((cat) => {
            const pct = Math.round((cat.count / total) * 100);
            return (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] border border-[#C3CCDA]"
                    style={{ backgroundColor: cat.color }}
                  ></span>
                  <span className="text-[#212121] font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-1 font-bold font-mono">
                  <span className="text-[#212121]">{cat.count}</span>
                  <span className="text-[#5C6269] text-[10px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Section: Key Performance & Fleet Health Metrics */}
        <div className="col-span-4 space-y-2 pl-2">
          {/* Average Battery Metric */}
          <div className="bg-[#F6F5FA] p-2 rounded border border-[#C3CCDA] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center text-[#212121] font-bold">
                <Zap className="w-3.5 h-3.5 mr-1 text-[#212121]" /> Battery Fleet Average
              </span>
              <span className="font-bold text-xs font-mono">{avgBattery}%</span>
            </div>
            <div className="w-full bg-[#D8DFE9] h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${avgBattery}%`,
                  backgroundColor: avgBattery > 50 ? "#95C292" : avgBattery > 20 ? "#EED868" : "#EBA398",
                }}
              ></div>
            </div>
          </div>

          {/* Operational Efficiency Badges */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F6F5FA] p-1.5 rounded border border-[#C3CCDA] text-center">
              <span className="text-[9px] text-[#5C6269] uppercase font-bold block">Collision Avoidance</span>
              <span className="text-xs font-bold text-[#212121] flex items-center justify-center mt-0.5">
                <ShieldCheck className="w-3 h-3 mr-1" /> Active
              </span>
            </div>
            <div className="bg-[#F6F5FA] p-1.5 rounded border border-[#C3CCDA] text-center">
              <span className="text-[9px] text-[#5C6269] uppercase font-bold block">Path Efficiency</span>
              <span className="text-xs font-bold text-[#212121] flex items-center justify-center mt-0.5">
                <Gauge className="w-3 h-3 mr-1" /> 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
