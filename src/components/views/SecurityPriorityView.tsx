import React from "react";
import { useFleetStore } from "../../store/useFleetStore";
import { ShieldCheck, GitCommit, Lock, LockOpen } from "lucide-react";

export const SecurityPriorityView: React.FC = () => {
  const { peerPackets, anomalies, amrs } = useFleetStore();

  const sortedAmrsByAgedPriority = [...amrs].sort((a, b) => b.agedPriorityScore - a.agedPriorityScore);

  const getGateChip = (pass: boolean, label: string) => {
    return pass ? (
      <span className="bg-[#CFDECA] border border-[#C3CCDA] text-[#212121] text-[9px] font-bold px-1 py-0.5 rounded-[3px] font-mono">
        {label}: PASS
      </span>
    ) : (
      <span className="bg-[#F2B8B5] border border-[#C3CCDA] text-[#212121] text-[9px] font-bold px-1 py-0.5 rounded-[3px] font-mono">
        {label}: FAIL
      </span>
    );
  };

  return (
    <div className="flex-1 p-4 bg-[#F6F5FA] text-[#212121] overflow-y-auto space-y-4 select-none">
      {/* View Header */}
      <div className="border-b border-[#C3CCDA] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
            Security & Priority Matrix Console
          </h2>
          <p className="text-xs text-[#5C6269]">
            Peer packet integrity trust verification stream and priority aging deadlock recovery
          </p>
        </div>

        <div className="flex space-x-2 font-mono text-xs font-bold">
          <span className="bg-[#CFDECA] px-2.5 py-1 rounded-[4px] border border-[#C3CCDA]">
            Integrity: Verified
          </span>
          <span className="bg-[#EFF0A3] px-2.5 py-1 rounded-[4px] border border-[#C3CCDA]">
            Priority Aging: Active
          </span>
        </div>
      </div>

      {/* SECTION 1: TRUST PANEL */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-3">
        <div className="flex items-center justify-between border-b border-[#C3CCDA] pb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#212121]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Trust Panel: Peer Packet Integrity & Gate Audit
            </h3>
          </div>

          {/* Anomaly Counters */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="bg-[#F6F5FA] border border-[#C3CCDA] px-2 py-0.5 rounded-[4px]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Seq Gaps</span>
              <span className="font-bold text-[#212121]">{anomalies.sequenceGaps}</span>
            </div>
            <div className="bg-[#F6F5FA] border border-[#C3CCDA] px-2 py-0.5 rounded-[4px]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Integrity Failures</span>
              <span className="font-bold text-[#212121]">{anomalies.hmacFailures}</span>
            </div>
            <div className="bg-[#F6F5FA] border border-[#C3CCDA] px-2 py-0.5 rounded-[4px]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Stale Rejections</span>
              <span className="font-bold text-[#212121]">{anomalies.staleRejections}</span>
            </div>
          </div>
        </div>

        {/* Peer Packets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F5FA] text-[#5C6269] font-bold uppercase border-b border-[#C3CCDA]">
              <tr>
                <th className="p-2.5">Packet ID</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Sender ID</th>
                <th className="p-2.5">Seq #</th>
                <th className="p-2.5">Packet Integrity</th>
                <th className="p-2.5">Trust Gate Result</th>
                <th className="p-2.5">Age at Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3CCDA] font-mono text-[#212121]">
              {peerPackets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-[#5C6269] font-sans">
                    No peer packets received yet.
                  </td>
                </tr>
              ) : (
                peerPackets.slice(0, 10).map((pkt) => (
                  <tr key={pkt.id} className="hover:bg-[#F6F5FA] transition-colors">
                    <td className="p-2.5 font-bold">{pkt.id}</td>
                    <td className="p-2.5 text-[#5C6269]">{pkt.timestamp}</td>
                    <td className="p-2.5 font-bold">{pkt.senderId}</td>
                    <td className="p-2.5">#{pkt.seq}</td>
                    <td className="p-2.5 font-bold">
                      {pkt.hmacValid ? (
                        <span className="flex items-center text-[#212121]">
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          VALID
                        </span>
                      ) : (
                        <span className="flex items-center text-[#4A1513]">
                          <LockOpen className="w-3.5 h-3.5 mr-1 text-[#4A1513]" />
                          INVALID
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <div className="flex space-x-1">
                        {getGateChip(pkt.trustGate.relevance, "REL")}
                        {getGateChip(pkt.trustGate.freshness, "FRSH")}
                        {getGateChip(pkt.trustGate.trust, "TRST")}
                        {getGateChip(pkt.trustGate.benefit, "BNFT")}
                      </div>
                    </td>
                    <td className="p-2.5 text-[#5C6269]">{pkt.ageMs}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: PRIORITY AND DEADLOCK PANEL */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-[#C3CCDA] pb-2">
          <div className="flex items-center space-x-2">
            <GitCommit className="w-5 h-5 text-[#212121]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Priority & Deadlock Panel: Wait-For Graph & Priority Aging
            </h3>
          </div>
          <span className="bg-[#CFDECA] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase border border-[#C3CCDA]">
            DEADLOCK RECOVERY READY
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Wait-For Directed Node Graph (SVG) */}
          <div className="lg:col-span-5 bg-[#F6F5FA] border border-[#C3CCDA] rounded-[4px] p-3 flex flex-col items-center justify-center min-h-[220px]">
            <span className="text-[10px] font-bold text-[#5C6269] uppercase mb-2">
              AMR Wait-For Directed Node Graph
            </span>

            <svg className="w-full h-44" viewBox="0 0 300 160">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#212121" />
                </marker>
              </defs>

              {/* Node 1: AMR_001 */}
              <g transform="translate(60, 40)">
                <circle r="18" fill="#CFDECA" stroke="#212121" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontFamily="Times New Roman" fontWeight="bold" fill="#212121">
                  AMR_001
                </text>
              </g>

              {/* Node 2: AMR_002 */}
              <g transform="translate(240, 40)">
                <circle r="18" fill="#EFF0A3" stroke="#212121" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontFamily="Times New Roman" fontWeight="bold" fill="#212121">
                  AMR_002
                </text>
              </g>

              {/* Node 3: AMR_003 */}
              <g transform="translate(150, 120)">
                <circle r="18" fill="#CFDECA" stroke="#212121" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontFamily="Times New Roman" fontWeight="bold" fill="#212121">
                  AMR_003
                </text>
              </g>

              {/* Directed Edges */}
              <path d="M 80 40 L 215 40" stroke="#212121" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" />
              <path d="M 225 55 L 165 105" stroke="#212121" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" />
              <path d="M 135 105 L 75 55" stroke="#212121" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrow)" />

              <text x="150" y="28" textAnchor="middle" fontSize="8" fontFamily="Times New Roman" fill="#5C6269">
                Junction Wait
              </text>
            </svg>

            <span className="text-[10px] text-[#5C6269] text-center font-mono">
              Directed edges indicate AMR right-of-way yielding. Priority aging prevents infinite circular wait.
            </span>
          </div>

          {/* Priority Aging Table (Sorted by Aged Priority) */}
          <div className="lg:col-span-7 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F6F5FA] text-[#5C6269] font-bold uppercase border-b border-[#C3CCDA]">
                <tr>
                  <th className="p-2.5">AMR ID</th>
                  <th className="p-2.5">Base Priority</th>
                  <th className="p-2.5">Wait Time</th>
                  <th className="p-2.5">Current Aged Priority</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3CCDA] font-mono text-[#212121]">
                {sortedAmrsByAgedPriority.map((amr, idx) => (
                  <tr key={amr.id} className="hover:bg-[#F6F5FA] transition-colors">
                    <td className="p-2.5 font-bold">{amr.id}</td>
                    <td className="p-2.5">{amr.priorityScore.toFixed(2)}</td>
                    <td className="p-2.5 text-[#5C6269]">{amr.priorityAge.toFixed(1)}s</td>
                    <td className="p-2.5 font-bold">
                      <span className="bg-[#CFDECA] px-2 py-0.5 rounded-[4px] border border-[#C3CCDA]">
                        {amr.agedPriorityScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {idx === 0 ? (
                        <span className="text-[#212121] font-bold">PASSING (HIGHEST)</span>
                      ) : amr.statusState === "Yielding" ? (
                        <span className="text-[#4A1513] font-bold">YIELDING</span>
                      ) : (
                        <span className="text-[#5C6269]">MOVING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
