import React from "react";
import { useFleetStore } from "../../store/useFleetStore";
import { ShieldCheck, ShieldAlert, Lock, Unlock, RefreshCw, Activity } from "lucide-react";

export const SecurityTrustView: React.FC = () => {
  const { peerPackets, anomalies, events } = useFleetStore();

  const securityEvents = events.filter((e) => e.category === "security" || e.category === "connectivity");

  const getGateChip = (pass: boolean, label: string) => {
    return pass ? (
      <span className="bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[9px] font-mono px-1 py-0.5 rounded-sm">
        {label}: PASS
      </span>
    ) : (
      <span className="bg-red-950/80 border border-red-700 text-red-400 text-[9px] font-mono px-1 py-0.5 rounded-sm">
        {label}: FAIL
      </span>
    );
  };

  return (
    <div className="flex-1 p-3 flex flex-col space-y-3 bg-[#0d1117] overflow-y-auto select-none">
      <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 font-mono">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-[#f3f4f6] uppercase tracking-wider">
              SECURITY & TRUST AUDIT CONSOLE
            </h2>
            <p className="text-[11px] text-[#9ca3af]">
              Real-time peer packet integrity and zero-trust verification stream
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 px-2 py-1 rounded-sm">
            ENCRYPTION: ACTIVE
          </span>
          <span className="bg-[#1b2230] border border-[#242c38] text-[#9ca3af] px-2 py-1 rounded-sm">
            SECURITY KEY: ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#9ca3af] uppercase font-mono block">PACKETS AUDITED</span>
            <span className="text-xl font-bold font-mono text-[#f3f4f6] tabular-nums">{peerPackets.length}</span>
          </div>
          <div className="bg-[#1b2230] p-2 rounded-sm border border-[#242c38]">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#9ca3af] uppercase font-mono block">SEQUENCE GAPS DETECTED</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${anomalies.sequenceGaps > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {anomalies.sequenceGaps}
            </span>
          </div>
          <div className="bg-[#1b2230] p-2 rounded-sm border border-[#242c38]">
            <RefreshCw className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#9ca3af] uppercase font-mono block">INTEGRITY FAILURES</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${anomalies.hmacFailures > 0 ? "text-red-400" : "text-emerald-400"}`}>
              {anomalies.hmacFailures}
            </span>
          </div>
          <div className="bg-[#1b2230] p-2 rounded-sm border border-[#242c38]">
            <Lock className="w-4 h-4 text-red-400" />
          </div>
        </div>

        <div className="bg-[#141a24] border border-[#242c38] p-3 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8b95a5] uppercase font-mono block">STALE DATA REJECTIONS</span>
            <span className={`text-xl font-bold font-mono tabular-nums ${anomalies.staleRejections > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {anomalies.staleRejections}
            </span>
          </div>
          <div className="bg-[#1b2230] p-2 rounded-sm border border-[#242c38]">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-[420px]">
        <div className="lg:col-span-2 bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col overflow-hidden">
          <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase tracking-wider">
              PEER PACKET AUDIT LOG (LAST {peerPackets.length} PACKETS)
            </span>
            <span className="text-[10px] font-mono text-[#8b95a5]">STREAMING 5-10 Hz</span>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-[#0d1117] border-b border-[#242c38] text-[#8b95a5] uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-2">TIMESTAMP</th>
                  <th className="p-2">SENDER ID</th>
                  <th className="p-2">SEQ NUM</th>
                  <th className="p-2">INTEGRITY VALID</th>
                  <th className="p-2">TRUST GATE CHECKS</th>
                  <th className="p-2">STATE</th>
                  <th className="p-2 text-right">AGE (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242c38]">
                {peerPackets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#8b95a5]">
                      WAITING FOR PEER MESH TELEMETRY PACKETS...
                    </td>
                  </tr>
                ) : (
                  peerPackets.map((pkt) => (
                    <tr key={pkt.id} className="hover:bg-[#1b2230] transition-colors">
                      <td className="p-2 text-[#8b95a5] tabular-nums whitespace-nowrap">{pkt.timestamp}</td>
                      <td className="p-2 font-bold text-[#e4e8ee]">{pkt.senderId}</td>
                      <td className="p-2 text-amber-400 tabular-nums">#{pkt.seq}</td>
                      <td className="p-2">
                        {pkt.hmacValid ? (
                          <span className="inline-flex items-center bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                            <Lock className="w-3 h-3 mr-1 fill-emerald-400" />
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-red-950/80 border border-red-700 text-red-400 text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                            <Unlock className="w-3 h-3 mr-1" />
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {getGateChip(pkt.trustGate.relevance, "REL")}
                          {getGateChip(pkt.trustGate.freshness, "FRSH")}
                          {getGateChip(pkt.trustGate.trust, "TRST")}
                          {getGateChip(pkt.trustGate.benefit, "BEN")}
                        </div>
                      </td>
                      <td className="p-2">
                        {pkt.trustState === "verified" && (
                          <span className="text-emerald-400 font-bold">VERIFIED</span>
                        )}
                        {pkt.trustState === "stale" && (
                          <span className="text-amber-400 font-bold">STALE</span>
                        )}
                        {pkt.trustState === "unverified" && (
                          <span className="text-red-400 font-bold">UNVERIFIED</span>
                        )}
                      </td>
                      <td className="p-2 text-right text-[#e4e8ee] tabular-nums font-bold">{pkt.ageMs} ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#141a24] border border-[#242c38] rounded-sm flex flex-col overflow-hidden">
          <div className="bg-[#1b2230] border-b border-[#242c38] px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#e4e8ee] uppercase tracking-wider">
              SECURITY & MESH EVENTS ({securityEvents.length})
            </span>
            <span className="text-[10px] font-mono text-[#8b95a5]">PEER MESH NETWORK LOG</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 font-mono text-[11px]">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-[#8b95a5]">NO SECURITY ANOMALIES LOGGED</div>
            ) : (
              securityEvents.map((evt) => (
                <div key={evt.id} className="bg-[#0d1117] border border-[#242c38] p-2 rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#8b95a5] tabular-nums">{evt.timestamp}</span>
                    <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-1 rounded-sm">
                      {evt.category}
                    </span>
                  </div>
                  <p className="text-[#e4e8ee] leading-tight text-[11px]">{evt.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
