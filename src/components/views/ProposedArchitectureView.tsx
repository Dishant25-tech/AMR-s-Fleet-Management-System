import React from "react";
import { useFleetStore } from "../../store/useFleetStore";
import {
  Cpu,
  Eye,
  GitBranch,
  Radio,
  ShieldAlert,
  RefreshCw,
  WifiOff,
  LayoutDashboard,
  Zap,
  ArrowRight,
  Check,
  Activity,
  Layers,
} from "lucide-react";

export const ProposedArchitectureView: React.FC = () => {
  const { amrs, taskQueue, cbsConflicts, chokepoints, addTask, addEvent } = useFleetStore();

  // 9 Solution Pillars mapped directly to the User's Image
  const solutionPillars = [
    {
      id: 1,
      title: "Hybrid Edge-AI Architecture",
      subtitle: "Central server assigns tasks; AMRs decide trajectories locally",
      addresses: "Reduces latency and dependency on the central server",
      icon: <Cpu className="w-5 h-5 text-amber-500" />,
      status: "ACTIVE",
      metrics: "Central Task Dispatch | 10 Hz Real-Time Collision Avoidance",
      liveDetail: `${amrs.filter((a) => a.commMode === "central").length} AMRs in Central sync, ${amrs.filter((a) => a.commMode !== "central").length} running on Edge Autonomous mode.`,
    },
    {
      id: 2,
      title: "Sensor-Based Perception",
      subtitle: "LiDAR (2D/3D), Dual Depth Cameras, ToF/Ultrasonic, IMU 9-DOF, Odometry",
      addresses: "Real-time awareness of obstacles, AMRs, and warehouse surroundings",
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      status: "STREAMING",
      metrics: "360° LiDAR | 0.02m Precision",
      liveDetail: "10 Hz Sensor Fusion streaming 9-DOF IMU yaw angles & Wheel Odometry feedback.",
    },
    {
      id: 3,
      title: "Central Path Planning",
      subtitle: "Global Pathfinder, Spatiotemporal Conflict Detection, Dynamic Rerouting",
      addresses: "Optimized routes, minimizing aisle conflicts and waiting time",
      icon: <GitBranch className="w-5 h-5 text-blue-400" />,
      status: "OPTIMIZED",
      metrics: "90° Manhattan Aisle Grid",
      liveDetail: `${cbsConflicts.length} Spatiotemporal conflicts detected & resolved.`,
    },
    {
      id: 4,
      title: "Intent & Event-Driven Comms",
      subtitle: "Routes and intent shared only when required via P2P Peer Mesh",
      addresses: "Efficient AMR-to-AMR coordination, minimal network traffic",
      icon: <Radio className="w-5 h-5 text-purple-400" />,
      status: "LOW BANDWIDTH",
      metrics: "4-Stage Trust Gate (Rel, Frsh, Trst, Ben)",
      liveDetail: "Event-driven authenticated telemetry broadcast active. Zero redundant full-path broadcasts.",
    },
    {
      id: 5,
      title: "Edge-AI Collision Avoidance",
      subtitle: "Local AI acts immediately on real-time sensor data & obstacle avoidance",
      addresses: "Immediate local response to unexpected static and dynamic obstacles",
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      status: "10 HZ REACTIVE",
      metrics: "Velocity Obstacle Half-Planes",
      liveDetail: `${amrs.filter((a) => a.nhOrcaActive).length} AMRs currently executing reactive ORCA half-plane vector adjustments.`,
    },
    {
      id: 6,
      title: "Dynamic Conflict Resolution & Re-routing",
      subtitle: "Resolves intersection conflicts, deadlocks, and dynamic aisle blockages",
      addresses: "Resolves intersection conflicts, deadlocks, and unblocks aisle bottlenecks",
      icon: <RefreshCw className="w-5 h-5 text-cyan-400" />,
      status: "MONITORED",
      metrics: "Chokepoints Monitored: 4 Nodes",
      liveDetail: `${chokepoints.filter((cp) => cp.status !== "CLEAR").length} Chokepoint Junctions undergoing priority arbitration right-of-way.`,
    },
    {
      id: 7,
      title: "Dead-Zone Resilience & Broadcasting",
      subtitle: "Broadcasts planned path & ETA, then runs autonomously inside Wi-Fi dead zones",
      addresses: "Autonomous operation; peers anticipate routes during Wi-Fi loss",
      icon: <WifiOff className="w-5 h-5 text-rose-400" />,
      status: "RESILIENT",
      metrics: "Dead Zone Polygon Active",
      liveDetail: `${amrs.filter((a) => a.commMode === "mesh" || a.commMode === "isolated").length} AMRs operating autonomously inside dead zone with local P2P peer mesh link.`,
    },
    {
      id: 8,
      title: "Task Reassignment & Fleet Dashboard",
      subtitle: "Live fleet status; tasks automatically shift from unavailable or fault AMRs",
      addresses: "Real-time visibility of position, battery, task, and comms status",
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" />,
      status: "SYNCHRONIZED",
      metrics: "Full Telemetry Dashboard",
      liveDetail: "Dynamic task dispatcher monitoring 4 active tasks & queue reassignment.",
    },
    {
      id: 9,
      title: "Dynamic Task Allocation",
      subtitle: "Tasks assigned and reallocated dynamically by AMR availability, battery & load",
      addresses: "Tasks assigned and reassigned efficiently by AMR availability",
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      status: "DYNAMIC",
      metrics: "Aged Priority Matrix",
      liveDetail: `Shift Queue: ${taskQueue.filter((t) => t.status === "queued").length} tasks waiting for optimal AMR dispatch.`,
    },
  ];

  // Helper trigger action to simulate Wi-Fi dead zone test
  const handleSimulateDeadZone = () => {
    addEvent({
      id: `EVT-TEST-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: "connectivity",
      text: "SYSTEM TEST: Triggered Dead-Zone Resilience verification. AMR_003 pre-broadcasted path & switched to autonomous local P2P mesh mode.",
    });
  };

  // Helper trigger action to inject high-priority task
  const handleInjectEmergencyTask = () => {
    const id = `TSK-EMG-${Math.floor(100 + Math.random() * 900)}`;
    addTask({
      id,
      type: "Pick",
      status: "active",
      assignedAmrId: "AMR_001",
      targetRack: "RACK A1",
      destination: [195, 25],
      priority: 15.0,
      createdAt: new Date().toLocaleTimeString(),
      etaSeconds: 20,
    });
    addEvent({
      id: `EVT-EMG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: "task",
      text: `SYSTEM TEST: Emergency Task ${id} injected. Dynamic Task Allocation Engine reallocated priority score to 15.0.`,
    });
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-[#0d1117] overflow-y-auto space-y-4 font-sans select-none">
      {/* Header Banner */}
      <div className="bg-[#141a24] border border-[#242c38] rounded-sm p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>SIH 2026 Official Technical Solution Architecture</span>
          </div>
          <h1 className="text-lg font-bold text-[#e4e8ee] tracking-tight">
            Proposed Solution & Problem Mapping Matrix
          </h1>
          <p className="text-xs text-[#8b95a5] max-w-3xl mt-1 leading-relaxed">
            Direct mapping of our 9 core architectural innovations to real-world industrial warehouse challenges.
            Demonstrating hybrid Edge-AI execution, sensor perception, path planning, and dead-zone resilience.
          </p>
        </div>

        {/* Quick Action Simulation Buttons */}
        <div className="flex items-center space-x-2 self-stretch md:self-auto">
          <button
            onClick={handleSimulateDeadZone}
            className="flex-1 md:flex-initial px-3 py-1.5 bg-[#1b2230] border border-[#242c38] hover:border-amber-500/50 text-[#e4e8ee] hover:text-amber-400 rounded-sm text-xs font-mono font-medium flex items-center justify-center transition-colors"
          >
            <WifiOff className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            <span>Test Dead-Zone Mode</span>
          </button>
          <button
            onClick={handleInjectEmergencyTask}
            className="flex-1 md:flex-initial px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-sm text-xs font-mono font-semibold flex items-center justify-center transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            <span>Inject Emergency Task</span>
          </button>
        </div>
      </div>

      {/* Solution vs. Problem Mapping Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {solutionPillars.map((item) => (
          <div
            key={item.id}
            className="bg-[#141a24] border border-[#242c38] rounded-sm p-3.5 flex flex-col justify-between hover:border-[#344256] transition-all"
          >
            {/* Top Card Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-[#1b2230] border border-[#242c38] rounded-sm">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8b95a5] uppercase tracking-wider block">
                      Pillar #{item.id}
                    </span>
                    <h2 className="text-xs font-bold text-[#e4e8ee] tracking-wide">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-[#1b2230] border border-[#242c38] px-2 py-0.5 rounded-sm text-emerald-400 font-semibold flex items-center">
                  <Check className="w-3 h-3 mr-1 text-emerald-400" />
                  {item.status}
                </span>
              </div>

              {/* Proposed Solution Block */}
              <div className="bg-[#0b0f17] border border-[#1e2634] p-2.5 rounded-sm mb-2.5">
                <span className="text-[10px] font-mono text-amber-500 font-semibold block uppercase mb-0.5">
                  Proposed Solution Feature
                </span>
                <p className="text-xs text-[#cbd5e1] font-medium leading-normal">
                  {item.subtitle}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="flex items-center justify-center my-1 text-[#475569]">
                <ArrowRight className="w-4 h-4 text-amber-500 rotate-90 md:rotate-0" />
              </div>

              {/* How it Addresses the Problem Block */}
              <div className="bg-[#17202d] border border-[#2a374a] p-2.5 rounded-sm">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold block uppercase mb-0.5">
                  How it Addresses the Problem
                </span>
                <p className="text-xs text-[#e2e8f0] font-semibold leading-normal">
                  {item.addresses}
                </p>
              </div>
            </div>

            {/* Live System Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-[#1e2634] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8b95a5]">{item.metrics}</span>
              <span className="text-amber-400 font-medium truncate max-w-[170px]" title={item.liveDetail}>
                {item.liveDetail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* System Architecture Execution Flowchart */}
      <div className="bg-[#141a24] border border-[#242c38] rounded-sm p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#242c38] pb-2">
          <div className="flex items-center space-x-2 font-mono text-xs font-semibold text-[#e4e8ee]">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="uppercase tracking-wider">End-to-End System Integration Flow</span>
          </div>
          <span className="text-[11px] font-mono text-[#8b95a5]">
            10 Hz Real-Time Execution Loop
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center font-mono text-xs">
          <div className="bg-[#1b2230] border border-[#242c38] p-3 rounded-sm">
            <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Step 1: Task Assignment</span>
            <span className="text-[#e4e8ee] font-semibold">Central Task Dispatcher</span>
            <span className="text-[10px] text-[#8b95a5] block mt-1">Aged Priority Queueing</span>
          </div>

          <div className="bg-[#1b2230] border border-[#242c38] p-3 rounded-sm">
            <span className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Step 2: Path Planning</span>
            <span className="text-[#e4e8ee] font-semibold">Central Path Planning Engine</span>
            <span className="text-[10px] text-[#8b95a5] block mt-1">Orthogonal Aisles</span>
          </div>

          <div className="bg-[#1b2230] border border-[#242c38] p-3 rounded-sm">
            <span className="text-[10px] text-purple-400 uppercase font-bold block mb-1">Step 3: Intent Comms</span>
            <span className="text-[#e4e8ee] font-semibold">P2P Mesh Broadcast</span>
            <span className="text-[10px] text-[#8b95a5] block mt-1">Security Authentication Gate</span>
          </div>

          <div className="bg-[#1b2230] border border-[#242c38] p-3 rounded-sm">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">Step 4: Perception</span>
            <span className="text-[#e4e8ee] font-semibold">Sensor Fusion (LiDAR/IMU)</span>
            <span className="text-[10px] text-[#8b95a5] block mt-1">0.02m Spatial Grid</span>
          </div>

          <div className="bg-[#1b2230] border border-[#242c38] p-3 rounded-sm">
            <span className="text-[10px] text-yellow-400 uppercase font-bold block mb-1">Step 5: Edge-AI Avoidance</span>
            <span className="text-[#e4e8ee] font-semibold">Real-time Trajectory Engine</span>
            <span className="text-[10px] text-[#8b95a5] block mt-1">0 Collision Overlap</span>
          </div>
        </div>
      </div>
    </div>
  );
};
