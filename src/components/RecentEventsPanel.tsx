import React from "react";
import { useFleetStore } from "../store/useFleetStore";
import type { EventCategory } from "../types/fleet";
import { Terminal, Filter } from "lucide-react";

export const RecentEventsPanel: React.FC = () => {
  const { events, activeEventFilter, setEventFilter } = useFleetStore();

  const filteredEvents =
    activeEventFilter === "all"
      ? events
      : events.filter((e) => e.category === activeEventFilter);

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case "task":
        return "bg-[#CFDECA] border-[#C3CCDA] text-[#212121]";
      case "negotiation":
        return "bg-[#EFF0A3] border-[#C3CCDA] text-[#212121]";
      case "deadlock":
        return "bg-[#F2B8B5] border-[#C3CCDA] text-[#212121]";
      case "reroute":
        return "bg-[#D8DFE9] border-[#C3CCDA] text-[#212121]";
      case "security":
        return "bg-[#CFDECA] border-[#C3CCDA] text-[#212121]";
      case "connectivity":
        return "bg-[#EFF0A3] border-[#C3CCDA] text-[#212121]";
      default:
        return "bg-[#D5D7DA] border-[#C3CCDA] text-[#212121]";
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#C3CCDA] rounded-[4px] flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="bg-[#F6F5FA] border-b border-[#C3CCDA] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#212121]">
          <Terminal className="w-3.5 h-3.5 text-[#212121]" />
          <span className="uppercase tracking-wider">Recent Fleet Events</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <Filter className="w-3 h-3 text-[#5C6269]" />
          <select
            value={activeEventFilter}
            onChange={(e) => setEventFilter(e.target.value as EventCategory | "all")}
            className="bg-[#FFFFFF] border border-[#C3CCDA] text-[#212121] px-2 py-0.5 rounded-[4px] text-[10px] focus:outline-none"
          >
            <option value="all">ALL CATEGORIES</option>
            <option value="task">TASK</option>
            <option value="negotiation">NEGOTIATION</option>
            <option value="deadlock">DEADLOCK</option>
            <option value="reroute">REROUTE</option>
            <option value="security">SECURITY</option>
            <option value="connectivity">CONNECTIVITY</option>
          </select>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1.5 font-mono text-[11px]">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-6 text-[#5C6269]">No events matching filter</div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#F6F5FA] border border-[#C3CCDA] p-2 rounded-[4px] flex items-start space-x-2"
            >
              <span className="text-[#5C6269] text-[10px] tabular-nums shrink-0 pt-0.5">
                {evt.timestamp}
              </span>

              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded-[3px] border font-bold shrink-0 ${getCategoryBadge(
                  evt.category
                )}`}
              >
                {evt.category}
              </span>

              <span className="text-[#212121] leading-tight flex-1">{evt.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
