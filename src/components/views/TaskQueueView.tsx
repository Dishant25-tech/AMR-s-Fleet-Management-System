import React, { useState } from "react";
import { useFleetStore } from "../../store/useFleetStore";
import type { TaskCategory, TaskQueueItem } from "../../types/fleet";
import { RACK_AISLE_DESTINATIONS } from "../../simulation/mockEngine";
import { ListOrdered, Plus } from "lucide-react";

export const TaskQueueView: React.FC = () => {
  const { taskQueue, addTask } = useFleetStore();

  const [newType, setNewType] = useState<TaskCategory>("Pick");
  const [newRack, setNewRack] = useState<string>("RACK A3");
  const [newPriority, setNewPriority] = useState<number>(7.5);

  const handleInjectTask = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = RACK_AISLE_DESTINATIONS[newRack] || { x: 195, y: 140 };

    const newTask: TaskQueueItem = {
      id: `TSK-${Math.floor(100 + Math.random() * 900)}`,
      type: newType,
      status: "queued",
      assignedAmrId: null,
      targetRack: newRack,
      destination: [dest.x, dest.y],
      priority: newPriority,
      createdAt: new Date().toLocaleTimeString(),
      etaSeconds: Math.floor(30 + Math.random() * 60),
    };

    addTask(newTask);
  };

  const getStatusBadge = (status: TaskQueueItem["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="bg-[#CFDECA] border border-[#C3CCDA] text-[#212121] text-[10px] font-bold px-2 py-0.5 rounded-[4px] font-mono uppercase">
            ACTIVE
          </span>
        );
      case "queued":
        return (
          <span className="bg-[#EFF0A3] border border-[#C3CCDA] text-[#212121] text-[10px] font-bold px-2 py-0.5 rounded-[4px] font-mono uppercase">
            QUEUED
          </span>
        );
      case "complete":
        return (
          <span className="bg-[#D8DFE9] border border-[#C3CCDA] text-[#212121] text-[10px] font-bold px-2 py-0.5 rounded-[4px] font-mono uppercase">
            COMPLETE
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col space-y-4 bg-[#F6F5FA] text-[#212121] overflow-y-auto select-none">
      {/* View Header */}
      <div className="border-b border-[#C3CCDA] pb-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-5 h-5 text-[#212121]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
              Mission Control Panel
            </h2>
            <p className="text-xs text-[#5C6269]">
              Task Injector and Real-Time Shift Task Execution Queue
            </p>
          </div>
        </div>

        <div className="flex space-x-2 font-mono text-xs font-bold">
          <span className="bg-[#FFFFFF] border border-[#C3CCDA] px-2.5 py-1 rounded-[4px]">
            Total: {taskQueue.length}
          </span>
          <span className="bg-[#CFDECA] border border-[#C3CCDA] px-2.5 py-1 rounded-[4px]">
            Active: {taskQueue.filter((t) => t.status === "active").length}
          </span>
          <span className="bg-[#EFF0A3] border border-[#C3CCDA] px-2.5 py-1 rounded-[4px]">
            Queued: {taskQueue.filter((t) => t.status === "queued").length}
          </span>
        </div>
      </div>

      {/* Task Injector Form Card */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-2 mb-3">
          Mission Task Injector Form
        </h3>

        <form onSubmit={handleInjectTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-[#5C6269] uppercase mb-1">
              Task Type
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as TaskCategory)}
              className="w-full bg-[#F6F5FA] border border-[#C3CCDA] text-[#212121] px-2.5 py-1.5 rounded-[4px] text-xs font-mono font-bold focus:outline-none"
            >
              <option value="Pick">Pick</option>
              <option value="Place">Place</option>
              <option value="Audit">Audit</option>
              <option value="Charge">Charge</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5C6269] uppercase mb-1">
              Destination Rack / Location
            </label>
            <select
              value={newRack}
              onChange={(e) => setNewRack(e.target.value)}
              className="w-full bg-[#F6F5FA] border border-[#C3CCDA] text-[#212121] px-2.5 py-1.5 rounded-[4px] text-xs font-mono font-bold focus:outline-none"
            >
              <option value="RACK A1">RACK A1</option>
              <option value="RACK A2">RACK A2</option>
              <option value="RACK A3">RACK A3</option>
              <option value="RACK B1">RACK B1</option>
              <option value="RACK B2">RACK B2</option>
              <option value="RACK B3">RACK B3</option>
              <option value="RACK C1">RACK C1</option>
              <option value="RACK C2">RACK C2</option>
              <option value="RACK C3">RACK C3</option>
              <option value="BAY-1">CHARGING BAY 1</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5C6269] uppercase mb-1">
              Base Priority (1.0 - 10.0)
            </label>
            <input
              type="number"
              min="1.0"
              max="10.0"
              step="0.5"
              value={newPriority}
              onChange={(e) => setNewPriority(parseFloat(e.target.value))}
              className="w-full bg-[#F6F5FA] border border-[#C3CCDA] text-[#212121] px-2.5 py-1.5 rounded-[4px] text-xs font-mono font-bold focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-[#212121] hover:bg-[#333333] text-white font-bold text-xs py-2 rounded-[4px] transition-colors flex items-center justify-center space-x-1 uppercase cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inject Task</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Task Queue Table */}
      <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] p-4 flex-1 flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121] border-b border-[#C3CCDA] pb-2 mb-3">
          Live Task Queue Table
        </h3>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F5FA] text-[#5C6269] font-bold uppercase border-b border-[#C3CCDA]">
              <tr>
                <th className="p-2.5">Task ID</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Assigned AMR</th>
                <th className="p-2.5">Target Location</th>
                <th className="p-2.5">Priority Score</th>
                <th className="p-2.5">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C3CCDA] font-mono text-[#212121]">
              {taskQueue.map((item) => (
                <tr key={item.id} className="hover:bg-[#F6F5FA] transition-colors">
                  <td className="p-2.5 font-bold">{item.id}</td>
                  <td className="p-2.5 font-bold">{item.type}</td>
                  <td className="p-2.5">{getStatusBadge(item.status)}</td>
                  <td className="p-2.5 font-bold">
                    {item.assignedAmrId ? item.assignedAmrId : <span className="text-[#5C6269] font-normal">Unassigned</span>}
                  </td>
                  <td className="p-2.5">{item.targetRack}</td>
                  <td className="p-2.5 font-bold">{item.priority.toFixed(1)}</td>
                  <td className="p-2.5 text-[#5C6269]">
                    {item.status === "complete" ? "0s (Complete)" : `${item.etaSeconds}s`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
