import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import { simulationEngine } from "../simulation/mockEngine";
import { X, Battery, Lock, LockOpen, AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

export const AmrDetailModal: React.FC = () => {
  const { amrs, auditModalAmrId, setAuditModalAmrId } = useFleetStore();

  if (!auditModalAmrId) return null;

  const amr = amrs.find((a) => a.id === auditModalAmrId);
  if (!amr) return null;

  const isTrustValid = amr.hmacValid && amr.trustState === "verified";

  return (
    <div className="fixed inset-0 bg-[#212121]/40 backdrop-none z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] w-full max-w-xl shadow-none overflow-hidden font-mono text-xs text-[#212121]">
        {/* Modal Header */}
        <div className="bg-[#F6F5FA] border-b border-[#C3CCDA] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-[#212121] uppercase font-mono">{amr.id} Telemetry Audit Detail</span>
            {amr.emergencyStatus && (
              <span className="bg-[#F2B8B5] text-[#212121] text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] border border-[#C3CCDA] font-mono">
                E-STOP ACTIVE
              </span>
            )}
          </div>
          <button
            onClick={() => setAuditModalAmrId(null)}
            className="text-[#5C6269] hover:text-[#212121] p-1 rounded-[4px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Detail Grid */}
        <div className="p-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#F6F5FA] p-2.5 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[10px] text-[#5C6269] uppercase font-sans font-semibold block">Battery Capacity</span>
              <div className="flex items-center font-bold text-sm text-[#212121] mt-0.5">
                <Battery className="w-4 h-4 mr-1 text-[#212121]" />
                <span className="tabular-nums">{amr.battery.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-[#F6F5FA] p-2.5 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[10px] text-[#5C6269] uppercase font-sans font-semibold block">Comm Mode</span>
              <span className="font-bold text-xs uppercase text-[#212121] mt-0.5 block">{amr.commMode.toUpperCase()}</span>
            </div>

            <div className="bg-[#F6F5FA] p-2.5 rounded-[4px] border border-[#C3CCDA]">
              <span className="text-[10px] text-[#5C6269] uppercase font-sans font-semibold block">Velocity</span>
              <span className="font-bold text-xs text-[#212121] tabular-nums mt-0.5 block">{amr.velocity.toFixed(2)} m/s</span>
            </div>
          </div>

          <div className="bg-[#F6F5FA] p-3 rounded-[4px] border border-[#C3CCDA] space-y-2">
            <span className="text-[10px] text-[#212121] font-bold uppercase block border-b border-[#C3CCDA] pb-1 font-sans">
              Localization & Kinematics
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Grid Position (X, Y)</span>
                <span className="text-[#212121] font-bold tabular-nums">
                  [{Math.round(amr.position.x)}, {Math.round(amr.position.y)}]
                </span>
              </div>
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Heading Angle</span>
                <span className="text-[#212121] font-bold tabular-nums">{amr.heading}°</span>
              </div>
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Payload Weight</span>
                <span className="text-[#212121] font-bold tabular-nums">{amr.loadWeight} kg</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F6F5FA] p-3 rounded-[4px] border border-[#C3CCDA] space-y-2">
            <span className="text-[10px] text-[#212121] font-bold uppercase block border-b border-[#C3CCDA] pb-1 font-sans">
              Priority Matrix & Aging Telemetry
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Base Priority</span>
                <span className="text-[#212121] font-bold tabular-nums">{amr.priorityScore.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Priority Age</span>
                <span className="text-[#212121] font-bold tabular-nums">{amr.priorityAge.toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Aged Priority Score</span>
                <span className="text-[#212121] font-bold text-xs tabular-nums">{amr.agedPriorityScore.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F6F5FA] p-3 rounded-[4px] border border-[#C3CCDA] space-y-2">
            <span className="text-[10px] text-[#212121] font-bold uppercase block border-b border-[#C3CCDA] pb-1 font-sans">
              Security & Peer Packet Status
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Packet Integrity</span>
                <span className="font-bold flex items-center mt-0.5">
                  {isTrustValid ? (
                    <>
                      <Lock className="w-3.5 h-3.5 mr-1 text-[#212121]" />
                      <span className="text-[#212121]">VERIFIED</span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-3.5 h-3.5 mr-1 text-[#4A1513]" />
                      <span className="text-[#4A1513]">UNVERIFIED</span>
                    </>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[#5C6269] text-[10px] block font-sans">Collision Avoidance</span>
                <span className="text-[#212121] font-bold mt-0.5 block">
                  {amr.nhOrcaActive ? "Active" : "Standby"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Operational Action Controls */}
        <div className="bg-[#F6F5FA] border-t border-[#C3CCDA] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => simulationEngine.toggleEmergencyStop(amr.id)}
              className={`px-2.5 py-1 rounded-[4px] font-bold text-[10px] uppercase transition-colors cursor-pointer flex items-center space-x-1 ${
                amr.emergencyStatus
                  ? "bg-[#212121] text-white hover:bg-[#333333]"
                  : "bg-[#F2B8B5] text-[#212121] hover:bg-[#e4a4a1] border border-[#C3CCDA]"
              }`}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>{amr.emergencyStatus ? "Resume AMR" : "Emergency Stop"}</span>
            </button>

            <button
              onClick={() => simulationEngine.forceReroute(amr.id)}
              className="px-2.5 py-1 rounded-[4px] bg-[#D8DFE9] hover:bg-[#C3CCDA] text-[#212121] font-bold text-[10px] uppercase border border-[#C3CCDA] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span>Re-route Path</span>
            </button>

            <button
              onClick={() => simulationEngine.auditHmacPacket(amr.id)}
              className="px-2.5 py-1 rounded-[4px] bg-[#CFDECA] hover:bg-[#beceb9] text-[#212121] font-bold text-[10px] uppercase border border-[#C3CCDA] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>Verify Packet</span>
            </button>
          </div>

          <button
            onClick={() => setAuditModalAmrId(null)}
            className="px-4 py-1.5 rounded-[4px] bg-[#212121] hover:bg-[#333333] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
