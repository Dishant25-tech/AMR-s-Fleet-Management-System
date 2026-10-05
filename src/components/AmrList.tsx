import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import type { AMR } from "../types/fleet";
import { Lock, LockOpen, Plus, ChevronDown, ChevronUp, FileText } from "lucide-react";

export const AmrList: React.FC = () => {
  const { amrs, selectedAmrId, setSelectedAmrId, setAuditModalAmrId, setRegisterModalOpen } = useFleetStore();

  const getCommBadge = (mode: AMR["commMode"]) => {
    switch (mode) {
      case "central":
        return (
          <span className="bg-[#CFDECA] border border-[#C3CCDA] text-[#212121] px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase">
            CENTRAL
          </span>
        );
      case "mesh":
        return (
          <span className="bg-[#EFF0A3] border border-[#C3CCDA] text-[#212121] px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase">
            MESH
          </span>
        );
      case "isolated":
        return (
          <span className="bg-[#F2B8B5] border border-[#C3CCDA] text-[#212121] px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase">
            ISOLATED
          </span>
        );
      default:
        return (
          <span className="bg-[#D5D7DA] border border-[#C3CCDA] text-[#212121] px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase">
            OFFLINE
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] flex flex-col h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="bg-[#F6F5FA] border-b border-[#C3CCDA] px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#212121] uppercase tracking-wider">
          Fleet AMR Roster ({amrs.length})
        </span>
        <button
          onClick={() => setRegisterModalOpen(true)}
          className="flex items-center space-x-1 text-[10px] font-bold bg-[#212121] hover:bg-[#333333] text-white px-2 py-1 rounded-[4px] transition-colors uppercase cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Register AMR</span>
        </button>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {amrs.length === 0 ? (
          <div className="text-center py-8 text-[#5C6269] text-xs">No AMRs registered in fleet.</div>
        ) : (
          amrs.map((amr) => {
            const isSelected = selectedAmrId === amr.id;
            const isTrustValid = amr.hmacValid && amr.trustState === "verified";

            return (
              <div
                key={amr.id}
                onClick={() => setSelectedAmrId(isSelected ? null : amr.id)}
                className={`p-2.5 rounded-[4px] border cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#D8DFE9] border-[#212121]"
                    : "bg-[#F6F5FA] border-[#C3CCDA] hover:bg-[#EAEFF5]"
                }`}
              >
                {/* Compact Card Header */}
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#212121] font-mono">{amr.id}</span>
                    {getCommBadge(amr.commMode)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] text-[#212121]">
                      {Math.round(amr.battery ?? 0)}%
                    </span>

                    {/* Trust Lock Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAuditModalAmrId(amr.id);
                      }}
                      className="p-0.5 rounded hover:bg-[#C3CCDA]/40 transition-colors"
                      title="Click to view telemetry audit modal"
                    >
                      {isTrustValid ? (
                        <Lock className="w-3.5 h-3.5 text-[#212121]" />
                      ) : (
                        <LockOpen className="w-3.5 h-3.5 text-[#F2B8B5]" />
                      )}
                    </button>

                    {isSelected ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#5C6269]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#5C6269]" />
                    )}
                  </div>
                </div>

                {/* Current Task Line */}
                <div className="text-[11px] text-[#5C6269] flex justify-between items-center">
                  <span>
                    Task:{" "}
                    <strong className="text-[#212121] font-mono">
                      {amr.task ? `${amr.task.type} @ ${amr.task.targetRack || "Destination"}` : "Idle"}
                    </strong>
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] font-mono border border-[#C3CCDA] ${
                      amr.statusState === "Idle"
                        ? "bg-[#D5D7DA] text-[#212121]"
                        : amr.statusState === "Moving"
                        ? "bg-[#CFDECA] text-[#212121]"
                        : amr.statusState === "Task Execution" || amr.statusState === "Charging"
                        ? "bg-[#EFF0A3] text-[#212121]"
                        : "bg-[#F2B8B5] text-[#212121]"
                    }`}
                  >
                    {amr.statusState || "Idle"}
                  </span>
                </div>

                {/* Expanded Detail Panel */}
                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-[#C3CCDA] text-[11px] grid grid-cols-2 gap-1.5 font-mono text-[#212121]">
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Priority Score</span>
                      <span className="font-bold">{(amr.priorityScore ?? 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Priority Age</span>
                      <span className="font-bold">{(amr.priorityAge ?? 0).toFixed(1)}s</span>
                    </div>
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Velocity</span>
                      <span className="font-bold">{(amr.velocity ?? 0).toFixed(1)} m/s</span>
                    </div>
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Payload Weight</span>
                      <span className="font-bold">{amr.loadWeight ?? 0} kg</span>
                    </div>
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Heading</span>
                      <span className="font-bold">{amr.heading ?? 0}°</span>
                    </div>
                    <div>
                      <span className="text-[#5C6269] text-[9px] block font-sans">Packet Sequence</span>
                      <span className="font-bold">#{amr.seq ?? 0}</span>
                    </div>

                    <div className="col-span-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAuditModalAmrId(amr.id);
                        }}
                        className="w-full flex items-center justify-center space-x-1 py-1 px-2 bg-[#212121] hover:bg-[#333333] text-white rounded-[4px] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        <span>Audit Full Telemetry</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

