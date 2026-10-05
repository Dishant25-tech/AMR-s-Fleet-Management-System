import React from "react";
import { useFleetStore } from "../../store/useFleetStore";
import { Server, Radio, ShieldCheck, AlertTriangle } from "lucide-react";

export const ConnectivityView: React.FC = () => {
  const { amrs, events } = useFleetStore();

  const centralCount = amrs.filter((a) => a.commMode === "central").length;
  const meshCount = amrs.filter((a) => a.commMode === "mesh").length;
  const isolatedCount = amrs.filter((a) => a.commMode === "isolated").length;

  const connectivityEvents = events.filter((e) => e.category === "connectivity");

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case "central":
        return (
          <span className="bg-[#CFDECA] border border-[#C3CCDA] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase">
            CENTRAL LINK
          </span>
        );
      case "mesh":
        return (
          <span className="bg-[#EFF0A3] border border-[#C3CCDA] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase">
            LOCAL MESH
          </span>
        );
      case "isolated":
        return (
          <span className="bg-[#F2B8B5] border border-[#C3CCDA] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase">
            ISOLATED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-4 bg-[#F6F5FA] text-[#212121] overflow-y-auto space-y-4 select-none">
      {/* View Header */}
      <div className="border-b border-[#C3CCDA] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
            Connectivity Architecture Console
          </h2>
          <p className="text-xs text-[#5C6269]">
            Monitors central server telemetry links and peer-to-peer mesh fallback operation in dead zone areas.
          </p>
        </div>
        <div className="flex space-x-2 font-mono text-xs font-bold">
          <span className="bg-[#CFDECA] px-2.5 py-1 rounded-[4px] border border-[#C3CCDA]">
            Central: {centralCount}
          </span>
          <span className="bg-[#EFF0A3] px-2.5 py-1 rounded-[4px] border border-[#C3CCDA]">
            Mesh: {meshCount}
          </span>
          <span className="bg-[#F2B8B5] px-2.5 py-1 rounded-[4px] border border-[#C3CCDA]">
            Isolated: {isolatedCount}
          </span>
        </div>
      </div>

      {/* Large Visual Split: Central Link vs Local Mesh Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Central Server Link Status Card */}
        <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#C3CCDA] pb-2">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-[#212121]" />
              <h3 className="font-bold text-sm uppercase">Central Server Link</h3>
            </div>
            <span className="bg-[#CFDECA] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase border border-[#C3CCDA]">
              ONLINE (ACTIVE)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Active Server Links</span>
              <span className="text-base font-bold text-[#212121]">{centralCount} AMRs</span>
            </div>
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Server Latency</span>
              <span className="text-base font-bold text-[#212121]">12 ms</span>
            </div>
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Packet Stability</span>
              <span className="text-base font-bold text-[#212121]">99.8%</span>
            </div>
          </div>

          <p className="text-xs text-[#5C6269] leading-relaxed">
            Central server dispatches global tasks, updates occupancy grid maps, and processes telemetry streams for all AMRs operating outside dead zone boundaries.
          </p>
        </div>

        {/* Local Peer Mesh Link Status Card */}
        <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#C3CCDA] pb-2">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-[#212121]" />
              <h3 className="font-bold text-sm uppercase">Local Peer Mesh Link</h3>
            </div>
            <span className="bg-[#EFF0A3] text-[#212121] px-2 py-0.5 rounded-[4px] text-xs font-bold uppercase border border-[#C3CCDA]">
              MESH READY
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Mesh Node Peers</span>
              <span className="text-base font-bold text-[#212121]">{meshCount + isolatedCount} AMRs</span>
            </div>
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Mesh Broadcast Rate</span>
              <span className="text-base font-bold text-[#212121]">10 Hz</span>
            </div>
            <div className="bg-[#F6F5FA] p-2 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[#5C6269] text-[10px] block font-sans">Security Verification</span>
              <span className="text-base font-bold text-[#212121]">HMAC-Verified</span>
            </div>
          </div>

          <p className="text-xs text-[#5C6269] leading-relaxed">
            When AMRs enter the dead zone polygon, they switch to peer-to-peer mesh networking to coordinate collision avoidance and priority right-of-way directly without central server connection.
          </p>
        </div>
      </div>

      {/* Per-AMR Communication Status Table */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-2">
          Per-AMR Communication Telemetry & Disconnect Duration
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F5FA] text-[#5C6269] font-bold uppercase border-b border-[#C3CCDA]">
              <tr>
                <th className="p-2.5">AMR ID</th>
                <th className="p-2.5">Current Comm Mode</th>
                <th className="p-2.5">Time in Current Mode</th>
                <th className="p-2.5">Last Server Contact</th>
                <th className="p-2.5">Trust State</th>
                <th className="p-2.5">Packet Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3CCDA] font-mono text-[#212121]">
              {amrs.map((amr) => {
                const timeSinceLastContactSec = Math.floor((Date.now() - amr.lastServerContact) / 1000);
                const isIsolated = amr.commMode === "isolated";
                const isTrustOk = amr.hmacValid && amr.trustState === "verified";

                return (
                  <tr key={amr.id} className="hover:bg-[#F6F5FA] transition-colors">
                    <td className="p-2.5 font-bold">{amr.id}</td>
                    <td className="p-2.5">{getModeBadge(amr.commMode)}</td>
                    <td className="p-2.5 font-bold">
                      {isIsolated ? `${timeSinceLastContactSec}s (Isolated)` : "Active (Continuous)"}
                    </td>
                    <td className="p-2.5 text-[#5C6269]">
                      {isIsolated ? `${timeSinceLastContactSec}s ago` : "0.1s ago"}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                          amr.trustState === "verified"
                            ? "bg-[#CFDECA] text-[#212121] border-[#C3CCDA]"
                            : "bg-[#F2B8B5] text-[#212121] border-[#C3CCDA]"
                        }`}
                      >
                        {amr.trustState.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {isTrustOk ? (
                        <span className="flex items-center text-[#212121] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#212121]" />
                          PASS
                        </span>
                      ) : (
                        <span className="flex items-center text-[#4A1513] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#4A1513]" />
                          UNVERIFIED
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

      {/* Live Connectivity Transition Event Log */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex flex-col space-y-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-2">
          Connectivity Mode Transition Stream
        </h3>

        <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
          {connectivityEvents.length === 0 ? (
            <div className="text-center py-4 text-[#5C6269]">No connectivity transition events recorded</div>
          ) : (
            connectivityEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px] flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-[#5C6269] text-[10px]">{evt.timestamp}</span>
                  <span className="bg-[#EFF0A3] border border-[#C3CCDA] text-[#212121] text-[9px] px-1.5 py-0.5 rounded-[3px] font-bold uppercase">
                    CONNECTIVITY
                  </span>
                  <span className="text-[#212121]">{evt.text}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
