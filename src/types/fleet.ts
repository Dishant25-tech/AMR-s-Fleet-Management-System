export type CommMode = "central" | "mesh" | "isolated";
export type TrustState = "verified" | "stale" | "unverified";
export type TaskCategory = "Pick" | "Place" | "Charge" | "Audit";
export type TaskStatus = "queued" | "active" | "complete";
export type EventCategory = "system" | "task" | "negotiation" | "deadlock" | "security" | "reroute" | "connectivity";

export interface Position {
  x: number; // Warehouse grid X (0 to 600)
  y: number; // Warehouse grid Y (0 to 420)
}

export interface AMRTask {
  id: string;
  type: TaskCategory;
  destination: [number, number];
  targetRack?: string;
  status: TaskStatus;
  startTime?: number; // timestamp when active
}

export interface BlockedAisleAlert {
  nodeId: string;
  type: "static" | "dynamic";
  aisleName: string;
}

export interface AMR {
  id: string; // "AMR_001", "AMR_002", etc.
  position: Position;
  heading: number; // degrees 0-360
  velocity: number; // m/s
  battery: number; // 0-100
  loadWeight: number; // kg, 0 if unloaded
  emergencyStatus: boolean;
  task: AMRTask | null;
  dwellTimer: number; // seconds remaining for task execution at rack
  completedTaskCount: number;
  priorityScore: number; // Base priority score
  priorityAge: number; // seconds waited
  agedPriorityScore: number; // priorityScore + (priorityAge * 0.25)
  commMode: CommMode;
  lastServerContact: number; // ms timestamp
  trustState: TrustState;
  hmacValid: boolean;
  seq: number;
  nhOrcaActive: boolean; // true when reactive avoidance is active
  blockedAisleAlert: BlockedAisleAlert | null;
  path: Position[]; // planned path waypoints
  currentWaypointIndex: number;
  statusState: "Moving" | "Task Execution" | "Charging" | "Idle" | "Yielding" | "Fault";
  waitingForAmrId: string | null; // For collision/deadlock graph
  junctionId: string | null;
  haltReason?: "priority" | "obstacle" | null;
  haltDuration?: number;
  inDeadZone?: boolean;
  lastKnownServerPos?: Position;
}

export interface FleetEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  text: string;
}

export interface PeerPacket {
  id: string;
  timestamp: string;
  senderId: string;
  seq: number;
  hmacValid: boolean;
  trustGate: {
    relevance: boolean;
    freshness: boolean;
    trust: boolean;
    benefit: boolean;
  };
  trustState: TrustState;
  ageMs: number;
}

export interface TaskQueueItem {
  id: string;
  type: TaskCategory;
  status: TaskStatus;
  assignedAmrId: string | null;
  targetRack: string;
  destination: [number, number];
  priority: number;
  createdAt: string;
  etaSeconds: number;
  completedAt?: string;
  startTimeMs?: number;
  travelTimeSec?: number;
  idleWaitSec?: number;
}

export interface TaskKPI {
  taskId: string;
  robotId: string;
  totalLatency: number;     // seconds, assignment to completion
  activeTravelTime: number; // seconds actually moving
  idleWaitTime: number;     // seconds waiting/yielding
}

export interface AnomalyCounters {
  sequenceGaps: number;
  hmacFailures: number;
  staleRejections: number;
}
