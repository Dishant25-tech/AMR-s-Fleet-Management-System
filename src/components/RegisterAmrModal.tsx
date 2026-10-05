import React, { useState } from "react";
import { useFleetStore } from "../store/useFleetStore";
import { simulationEngine } from "../simulation/mockEngine";
import { PlusCircle, X, Bot, Server, CheckCircle2 } from "lucide-react";

export const RegisterAmrModal: React.FC = () => {
  const { isRegisterModalOpen, setRegisterModalOpen, amrs } = useFleetStore();

  const nextAmrNum = amrs.length + 1;
  const defaultId = `AMR_00${nextAmrNum}`;

  const [amrId, setAmrId] = useState<string>(defaultId);
  const [loadWeight, setLoadWeight] = useState<number>(250);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isRegisterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amrId.trim()) {
      setErrorMsg("Please enter a valid AMR ID.");
      return;
    }

    const res = simulationEngine.registerAMR({
      id: amrId.trim(),
      loadWeight: Number(loadWeight) || 250,
      battery: 100,
      startLocation: "Aisle 1",
      commMode: "central",
    });

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setErrorMsg("");
    setRegisterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#141a24] border border-[#242c38] rounded-sm w-full max-w-md overflow-hidden text-[#f3f4f6]">
        {/* Modal Header */}
        <div className="bg-[#1b2230] border-b border-[#242c38] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f3f4f6]">
              REGISTER NEW WAREHOUSE AMR WORKER
            </h3>
          </div>
          <button
            onClick={() => setRegisterModalOpen(false)}
            className="text-[#9ca3af] hover:text-[#f3f4f6] p-1 rounded-sm hover:bg-[#242c38] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {errorMsg && (
            <div className="bg-red-950/80 border border-red-700 text-red-400 p-2 rounded-sm text-[11px] font-bold">
              {errorMsg}
            </div>
          )}

          {/* Central Server Link Status Banner */}
          <div className="bg-[#0f2319] border border-emerald-800 p-2.5 rounded-sm flex items-center space-x-2 text-emerald-400 font-mono text-[11px]">
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Link Mode: <strong>Central Server Direct Link</strong> (Automatic Warehouse Onboarding)</span>
          </div>

          <div>
            <label className="block text-[10px] text-[#9ca3af] uppercase mb-1 font-bold">
              AMR WORKER IDENTIFIER (ID)
            </label>
            <input
              type="text"
              value={amrId}
              onChange={(e) => setAmrId(e.target.value)}
              placeholder="e.g. AMR_007"
              className="w-full bg-[#0d1117] border border-[#242c38] text-[#f3f4f6] px-3 py-2 rounded-sm focus:outline-none focus:border-amber-500 uppercase font-mono font-bold text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#9ca3af] uppercase mb-1 font-bold">
              PAYLOAD LOAD CAPACITY (KG)
            </label>
            <input
              type="number"
              min="10"
              max="600"
              value={loadWeight}
              onChange={(e) => setLoadWeight(Number(e.target.value))}
              placeholder="e.g. 250"
              className="w-full bg-[#0d1117] border border-[#242c38] text-[#f3f4f6] px-3 py-2 rounded-sm focus:outline-none focus:border-amber-500 font-mono text-sm"
              required
            />
          </div>

          <div className="text-[10px] text-[#8b95a5] bg-[#0d1117] p-2 rounded-sm border border-[#242c38] flex items-center space-x-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Upon registration, worker is automatically dispatched & linked to Central Server.</span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#242c38]">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="px-3 py-1.5 rounded-sm border border-[#242c38] bg-[#0d1117] text-[#9ca3af] hover:text-[#f3f4f6] transition-colors font-mono"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-sm bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center space-x-1.5 transition-colors uppercase font-mono cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>REGISTER WORKER TO CENTRAL SERVER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
