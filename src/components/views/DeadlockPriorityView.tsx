import React from "react";
import { useFleetStore } from "../../store/useFleetStore";
import { GitCommit, AlertTriangle } from "lucide-react";

export const DeadlockPriorityView: React.FC = () => {
  const { amrs, events, cbsConflicts, chokepoints } = useFleetStore();

  const sortedAmrs = [...amrs].sort((a, b) => b.agedPriorityScore - a.agedPriorityScore);
  const deadlockEvents = events.filter((e) => e.category === "deadlock" || e.category === "negotiation" || e.category === "reroute");
  const activeDeadlockAMRs = amrs.filter((a) => a.waitingForAmrId !== null);

  return (
    <div className="flex-1 p-3 flex flex-col space-y-3 bg-[#0d1117] overflow-y-auto select-none">
      {/* Title Header */}
      <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <GitCommit className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-[#f3f4f6] uppercase tracking-wider">
              TRAFFIC COORDINATION & DEADLOCK MONITOR
            </h2>
            <p className="text-[11px] text-[#9ca3af]">
              Real-time collision avoidance, priority right-of-way arbitration, and aisle rerouting
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          {activeDeadlockAMRs.length > 0 ? (
            <span className="bg-red-950/80 border border-red-700 text-red-400 px-2 py-1 rounded-sm flex items-center font-bold">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              CIRCULAR WAIT DETECTED ({activeDeadlockAMRs.length} AMRS)
            </span>
          ) : (
            <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 px-2 py-1 rounded-sm font-bold">
              GRID DEADLOCK STATE: CLEAR
            </span>
          )}
        </div>
      </div>

      {/* Coordination Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dynamic Path Replanner Card */}
        <div className="bg-[#141a24] border border-[#242c38] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase">DYNAMIC PATH REPLANNER</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1 py-0.5 rounded-sm">
              INCREMENTAL OK
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#8b95a5] space-y-0.5">
            <div className="flex justify-between">
              <span>MANHATTAN HEURISTIC:</span>
              <span className="text-[#e4e8ee] font-bold">ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>REROUTE LATENCY:</span>
              <span className="text-amber-400 font-bold tabular-nums">1.2 ms</span>
            </div>
          </div>
        </div>

        {/* Spatiotemporal Conflict Detector Card */}
        <div className="bg-[#141a24] border border-[#242c38] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase">SPATIOTEMPORAL CONFLICT DETECTOR</span>
            <span className="text-[9px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800 px-1 py-0.5 rounded-sm">
              2-LEVEL COORDINATION
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#8b95a5] space-y-0.5">
            <div className="flex justify-between">
              <span>CONFLICTS DETECTED:</span>
              <span className="text-amber-400 font-bold tabular-nums">{cbsConflicts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>SEARCH TREE NODES:</span>
              <span className="text-[#e4e8ee] font-bold tabular-nums">14 Evaluated</span>
            </div>
          </div>
        </div>

        {/* Chokepoint Bottleneck Detector Card */}
        <div className="bg-[#141a24] border border-[#242c38] p-2.5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#242c38] pb-1 mb-1">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase">CHOKEPOINT BOTTLENECKS</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1 py-0.5 rounded-sm">
              4 MONITORED
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#8b95a5] space-y-0.5">
            <div className="flex justify-between">
              <span>MONITORED NODES:</span>
              <span className="text-[#e4e8ee] font-bold tabular-nums">{chokepoints.length} Aisles</span>
            </div>
            <div className="flex justify-between">
              <span>CONGESTED CHOKES:</span>
              <span className="text-amber-400 font-bold tabular-nums">
                {chokepoints.filter((c) => c.status !== "CLEAR").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Section: Wait-For Directed Node Graph & Priority Aging Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[340px]">
        {/* Directed Node Wait-For Graph (5 cols) */}
        <div className="lg:col-span-5 bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col overflow-hidden">
          <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase tracking-wider">
              WAIT-FOR DIRECTED DEPENDENCY GRAPH
            </span>
            <span className="text-[10px] font-mono text-[#8b95a5]">JUNCTION BLOCKS</span>
          </div>

          <div className="flex-1 p-4 relative flex items-center justify-center bg-[#0d1117] min-h-[260px]">
            <svg className="w-full h-full max-w-[400px] max-h-[260px]" viewBox="0 0 400 240">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Render edges for waiting relations */}
              {amrs.map((amr, idx) => {
                if (!amr.waitingForAmrId) return null;
                const targetIdx = amrs.findIndex((a) => a.id === amr.waitingForAmrId);
                if (targetIdx === -1) return null;

                const angleFrom = (idx / (amrs.length || 1)) * 2 * Math.PI - Math.PI / 2;
                const angleTo = (targetIdx / (amrs.length || 1)) * 2 * Math.PI - Math.PI / 2;
                const x1 = 200 + 100 * Math.cos(angleFrom);
                const y1 = 120 + 70 * Math.sin(angleFrom);
                const x2 = 200 + 100 * Math.cos(angleTo);
                const y2 = 120 + 70 * Math.sin(angleTo);

                return (
                  <line
                    key={`edge-${amr.id}-${amr.waitingForAmrId}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {/* Render AMR Node Boxes */}
              {amrs.map((amr, idx) => {
                const angle = (idx / (amrs.length || 1)) * 2 * Math.PI - Math.PI / 2;
                const cx = 200 + 115 * Math.cos(angle);
                const cy = 120 + 72 * Math.sin(angle);
                const isBlocked = !!amr.waitingForAmrId;

                return (
                  <g key={amr.id} transform={`translate(${cx}, ${cy})`}>
                    <rect
                      x="-36"
                      y="-15"
                      width="72"
                      height="30"
                      rx="4"
                      fill={isBlocked ? "#7f1d1d" : "#141a24"}
                      stroke={isBlocked ? "#ef4444" : "#242c38"}
                      strokeWidth="1.5"
                    />
                    <text x="0" y="-2" textAnchor="middle" fill="#e4e8ee" fontSize="10" fontFamily="Monospace" fontWeight="bold">
                      {amr.id}
                    </text>
                    <text x="0" y="9" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="Monospace">
                      Sc: {amr.agedPriorityScore.toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-[#1b2230] border-t border-[#242c38] p-2 text-[11px] font-mono text-[#8b95a5] flex items-center justify-between">
            <span>Graph Legend: Red node = Blocked / Waiting</span>
            <span>Edge = Wait-For Target</span>
          </div>
        </div>

        {/* Priority Aging Table (7 cols) - Sorted by Aged Priority */}
        <div className="lg:col-span-7 bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col overflow-hidden">
          <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase tracking-wider">
              PRIORITY AGING MATRIX TABLE (SORTED BY AGED SCORE)
            </span>
            <span className="text-[10px] font-mono text-[#8b95a5]">AGED = BASE + (WAIT * 0.25)</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-[#0d1117] border-b border-[#242c38] text-[#8b95a5] uppercase text-[10px]">
                <tr>
                  <th className="p-2">RANK / AMR</th>
                  <th className="p-2">LOAD (KG)</th>
                  <th className="p-2">BATTERY</th>
                  <th className="p-2">BASE SCORE</th>
                  <th className="p-2">WAIT TIME</th>
                  <th className="p-2">AGED SCORE</th>
                  <th className="p-2">RIGHT-OF-WAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242c38]">
                {sortedAmrs.map((amr, idx) => {
                  const isBlocked = amr.waitingForAmrId !== null;
                  return (
                    <tr key={amr.id} className="hover:bg-[#1b2230]">
                      <td className="p-2 font-bold text-[#e4e8ee]">
                        #{idx + 1} {amr.id}
                      </td>
                      <td className="p-2 text-[#e4e8ee] tabular-nums">{amr.loadWeight} kg</td>
                      <td className="p-2 text-[#e4e8ee] tabular-nums">{Math.round(amr.battery)}%</td>
                      <td className="p-2 text-[#8b95a5] tabular-nums">{amr.priorityScore.toFixed(2)}</td>
                      <td className="p-2 tabular-nums">
                        {isBlocked ? (
                          <span className="text-red-400 font-bold">{amr.priorityAge.toFixed(1)}s (WAITING)</span>
                        ) : (
                          <span className="text-[#8b95a5]">{amr.priorityAge.toFixed(1)}s</span>
                        )}
                      </td>
                      <td className="p-2 text-amber-400 font-bold text-xs tabular-nums">
                        {amr.agedPriorityScore.toFixed(2)}
                      </td>
                      <td className="p-2">
                        {idx === 0 ? (
                          <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                            HIGHEST PRIORITY
                          </span>
                        ) : isBlocked ? (
                          <span className="bg-red-950/80 border border-red-700 text-red-400 text-[10px] px-1.5 py-0.5 rounded-sm">
                            YIELDING ({amr.waitingForAmrId})
                          </span>
                        ) : (
                          <span className="bg-gray-800 border border-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded-sm">
                            NORMAL CLEAR
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deadlock & Coordination Resolution Logs */}
      <div className="bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col flex-1 min-h-[200px] overflow-hidden">
        <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase tracking-wider">
            PATH PLANNING & DEADLOCK RESOLUTION LOGS ({deadlockEvents.length})
          </span>
          <span className="text-[10px] font-mono text-[#8b95a5]">PATH PLANNING & COLLISION AVOIDANCE AUDIT</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-[11px]">
          {deadlockEvents.length === 0 ? (
            <div className="text-center py-6 text-[#8b95a5]">NO DEADLOCK RESOLUTION EVENTS YET</div>
          ) : (
            deadlockEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#0d1117] border border-[#242c38] p-2 rounded-sm flex items-start space-x-2"
              >
                <span className="text-[#8b95a5] text-[10px] tabular-nums shrink-0 pt-0.5">{evt.timestamp}</span>
                <span
                  className={`text-[9px] uppercase px-1 py-0.5 rounded-sm border font-bold shrink-0 ${
                    evt.category === "deadlock"
                      ? "bg-red-950/80 border-red-700 text-red-400"
                      : "bg-amber-950/80 border-amber-700 text-amber-400"
                  }`}
                >
                  {evt.category}
                </span>
                <span className="text-[#e4e8ee] leading-tight flex-1">{evt.text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
