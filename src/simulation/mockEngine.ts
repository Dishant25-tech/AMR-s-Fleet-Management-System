import { useFleetStore } from "../store/useFleetStore";
import type { AMR, FleetEvent, PeerPacket, TaskQueueItem, TaskKPI, Position, AnomalyCounters, CommMode } from "../types/fleet";
import {
  detectCBSConflicts,
  updateChokepointStatus,
  computeNHORCA,
  runDLiteReroute,
  buildSafeAislePath,
} from "../algorithms/coordinationEngine";

// Professional Warehouse Rack Layout (600x400 Space)
export const RACKS = [
  { id: "R-A1", x: 70, y: 50, w: 100, h: 60, label: "RACK A1" },
  { id: "R-A2", x: 220, y: 50, w: 100, h: 60, label: "RACK A2" },
  { id: "R-A3", x: 370, y: 50, w: 100, h: 60, label: "RACK A3" },

  { id: "R-B1", x: 70, y: 170, w: 100, h: 60, label: "RACK B1" },
  { id: "R-B2", x: 220, y: 170, w: 100, h: 60, label: "RACK B2" },
  { id: "R-B3", x: 370, y: 170, w: 100, h: 60, label: "RACK B3" },

  { id: "R-C1", x: 70, y: 290, w: 100, h: 60, label: "RACK C1" },
  { id: "R-C2", x: 220, y: 290, w: 100, h: 60, label: "RACK C2" },
  { id: "R-C3", x: 370, y: 290, w: 100, h: 60, label: "RACK C3" },
];

export const DEAD_ZONE_POLYGON: Position[] = [
  { x: 345, y: 150 },
  { x: 580, y: 150 },
  { x: 580, y: 395 },
  { x: 345, y: 395 },
];

export const CHARGING_STATION: Position = { x: 30, y: 380 };

// Standardized Industrial Warehouse Unidirectional Traffic Loops
// Horizontal Aisles: Y = 25 (Top Aisle - EAST), 140 (Mid Aisle 1 - EAST), 260 (Mid Aisle 2 - WEST), 380 (Bottom Aisle - WEST)
// Vertical Aisles: X = 30 (Left Aisle - NORTH), 195 (Aisle 1 - SOUTH), 345 (Aisle 2 - SOUTH), 520 (Right Aisle - SOUTH)
const AISLE_ROUTES: Record<string, Position[]> = {
  AMR_001: [
    { x: 30, y: 25 },
    { x: 195, y: 25 },
    { x: 195, y: 140 },
    { x: 345, y: 140 },
    { x: 345, y: 260 },
    { x: 195, y: 260 },
    { x: 30, y: 260 },
    { x: 30, y: 25 },
  ],
  AMR_002: [
    { x: 195, y: 140 },
    { x: 345, y: 140 },
    { x: 345, y: 260 },
    { x: 195, y: 260 },
    { x: 30, y: 260 },
    { x: 30, y: 140 },
    { x: 30, y: 25 },
    { x: 195, y: 25 },
  ],
  AMR_003: [
    { x: 520, y: 380 },
    { x: 345, y: 380 },
    { x: 195, y: 380 },
    { x: 30, y: 380 },
    { x: 30, y: 260 },
    { x: 30, y: 140 },
    { x: 30, y: 25 },
    { x: 520, y: 25 },
  ],
  AMR_004: [
    { x: 30, y: 380 },
    { x: 30, y: 260 },
    { x: 30, y: 140 },
    { x: 30, y: 25 },
    { x: 195, y: 25 },
    { x: 345, y: 25 },
    { x: 520, y: 25 },
    { x: 520, y: 140 },
    { x: 520, y: 260 },
    { x: 520, y: 380 },
  ],
  AMR_005: [
    { x: 195, y: 260 },
    { x: 30, y: 260 },
    { x: 30, y: 380 },
    { x: 195, y: 380 },
    { x: 30, y: 380 },
    { x: 30, y: 260 },
    { x: 30, y: 140 },
    { x: 30, y: 25 },
    { x: 195, y: 25 },
    { x: 195, y: 140 },
  ],
  AMR_006: [
    { x: 520, y: 25 },
    { x: 520, y: 140 },
    { x: 520, y: 260 },
    { x: 520, y: 380 },
    { x: 345, y: 380 },
    { x: 195, y: 380 },
    { x: 30, y: 380 },
    { x: 30, y: 25 },
  ],
};

export const RACK_AISLE_DESTINATIONS: Record<string, Position> = {
  "RACK A1": { x: 195, y: 25 },
  "RACK A2": { x: 195, y: 140 },
  "RACK A3": { x: 345, y: 25 },
  "RACK B1": { x: 30, y: 140 },
  "RACK B2": { x: 195, y: 260 },
  "RACK B3": { x: 345, y: 140 },
  "RACK C1": { x: 30, y: 260 },
  "RACK C2": { x: 195, y: 380 },
  "RACK C3": { x: 345, y: 380 },
  "BAY-1": { x: 30, y: 380 },
};

function pointInPolygon(point: Position, polygon: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// HARD RACK BOUNDARY SAFETY GUARD
function isInsideAnyRack(pos: Position): boolean {
  const pad = 2; // Strict rack rectangle guard, 0% aisle overlap
  return RACKS.some(
    (r) =>
      pos.x >= r.x - pad &&
      pos.x <= r.x + r.w + pad &&
      pos.y >= r.y - pad &&
      pos.y <= r.y + r.h + pad
  );
}

function dist(p1: Position, p2: Position): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function getNextWaypointIndex(route: Position[], position: Position): number {
  if (route.length <= 1) return 0;

  const nextIndex = route.findIndex((waypoint, index) => index > 0 && dist(position, waypoint) >= 5.0);
  return nextIndex === -1 ? route.length - 1 : nextIndex;
}

function buildOperationalRoute(start: Position, goal: Position, blockedNodeId?: string | null): Position[] {
  const route = buildSafeAislePath(start, goal, blockedNodeId);
  return route.length > 0 ? route : [start, goal];
}

export function getClearanceHoldPosition(amrId: string, conflictPos: Position, fallbackIdx: number): Position {
  const match = amrId.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : fallbackIdx + 1;
  const holdX = num % 2 === 0 ? 520 : 30;
  const candidateRows = [25, 140, 260, 380]
    .filter((rowY) => Math.abs(rowY - conflictPos.y) > 55)
    .sort((a, b) => Math.abs(a - conflictPos.y) - Math.abs(b - conflictPos.y));

  return { x: holdX, y: candidateRows[0] ?? 25 };
}

// MULTI-DOCK CHARGING BAY (Docks inside enlarged Charging Bay box X=15..95, Y=380)
export function getChargingDockPosition(amrId: string, fallbackIdx: number): Position {
  const match = amrId.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : fallbackIdx + 1;
  const dockIndex = (num - 1) % 3; // Docks 0, 1, 2 at X=30, 55, 80
  return { x: 30 + dockIndex * 25, y: 380 };
}

// HORIZONTAL NUMERICAL IDLE QUEUE STAGING (Slots 1..6 at X=115, 157, 199, 241, 283, 325)
export function getStagingPosition(amrId: string, fallbackIdx: number): Position {
  const match = amrId.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : fallbackIdx + 1;
  const slotIndex = Math.max(1, num);
  const startX = 115;
  const spacing = 42;
  const posX = Math.min(325, startX + (slotIndex - 1) * spacing);
  return { x: posX, y: 380 };
}

function computeBasePriority(
  taskPriority: number,
  loadKg: number,
  battery: number,
  emergency: boolean
): number {
  let score = 1.0;
  if (emergency) score += 50.0;
  score += taskPriority * 1.0;
  score += (loadKg / 500.0) * 5.0;
  score += ((100.0 - battery) / 100.0) * 4.0;
  return parseFloat(score.toFixed(2));
}

function getFormattedTimestamp(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

const INITIAL_TASKS: TaskQueueItem[] = [
  { id: "TSK-801", type: "Pick", status: "active", assignedAmrId: "AMR_001", targetRack: "RACK A2", destination: [195, 140], priority: 8.5, createdAt: "11:15:00", etaSeconds: 35 },
  { id: "TSK-802", type: "Place", status: "active", assignedAmrId: "AMR_002", targetRack: "RACK B2", destination: [195, 260], priority: 7.2, createdAt: "11:18:20", etaSeconds: 50 },
  { id: "TSK-803", type: "Audit", status: "active", assignedAmrId: "AMR_003", targetRack: "RACK C3", destination: [345, 380], priority: 5.1, createdAt: "11:20:10", etaSeconds: 75 },
  { id: "TSK-804", type: "Pick", status: "active", assignedAmrId: "AMR_004", targetRack: "RACK A3", destination: [345, 25], priority: 6.8, createdAt: "11:22:05", etaSeconds: 40 },
  { id: "TSK-805", type: "Place", status: "active", assignedAmrId: "AMR_005", targetRack: "RACK C1", destination: [30, 260], priority: 7.0, createdAt: "11:25:00", etaSeconds: 90 },
  { id: "TSK-806", type: "Pick", status: "active", assignedAmrId: "AMR_006", targetRack: "RACK B3", destination: [345, 140], priority: 6.5, createdAt: "11:26:15", etaSeconds: 110 },
  { id: "TSK-807", type: "Charge", status: "queued", assignedAmrId: null, targetRack: "BAY-1", destination: [30, 380], priority: 9.9, createdAt: "11:27:00", etaSeconds: 120 },
  { id: "TSK-808", type: "Audit", status: "queued", assignedAmrId: null, targetRack: "RACK B1", destination: [30, 140], priority: 4.2, createdAt: "11:28:40", etaSeconds: 140 },
];

let initialAMRs: AMR[] = [
  {
    id: "AMR_001",
    position: { x: 30, y: 25 },
    heading: 0,
    velocity: 1.4,
    battery: 88,
    loadWeight: 320,
    emergencyStatus: false,
    task: { id: "TSK-801", type: "Pick", destination: [195, 140], targetRack: "RACK A2", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 11.8,
    priorityAge: 0,
    agedPriorityScore: 11.8,
    commMode: "central",
    lastServerContact: Date.now(),
    trustState: "verified",
    hmacValid: true,
    seq: 1420,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_001,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
  {
    id: "AMR_002",
    position: { x: 195, y: 140 },
    heading: 90,
    velocity: 1.5,
    battery: 74,
    loadWeight: 150,
    emergencyStatus: false,
    task: { id: "TSK-802", type: "Place", destination: [195, 260], targetRack: "RACK B2", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 8.4,
    priorityAge: 0,
    agedPriorityScore: 8.4,
    commMode: "central",
    lastServerContact: Date.now(),
    trustState: "verified",
    hmacValid: true,
    seq: 2105,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_002,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
  {
    id: "AMR_003",
    position: { x: 345, y: 260 },
    heading: 180,
    velocity: 1.2,
    battery: 45,
    loadWeight: 0,
    emergencyStatus: false,
    task: { id: "TSK-803", type: "Audit", destination: [345, 380], targetRack: "RACK C3", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 5.6,
    priorityAge: 0,
    agedPriorityScore: 5.6,
    commMode: "mesh",
    lastServerContact: Date.now() - 4200,
    trustState: "verified",
    hmacValid: true,
    seq: 890,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_003,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
  {
    id: "AMR_004",
    position: { x: 30, y: 380 },
    heading: 270,
    velocity: 1.6,
    battery: 92,
    loadWeight: 450,
    emergencyStatus: false,
    task: { id: "TSK-804", type: "Pick", destination: [345, 25], targetRack: "RACK A3", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 14.2,
    priorityAge: 0,
    agedPriorityScore: 14.2,
    commMode: "central",
    lastServerContact: Date.now(),
    trustState: "verified",
    hmacValid: true,
    seq: 3410,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_004,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
  {
    id: "AMR_005",
    position: { x: 195, y: 260 },
    heading: 270,
    velocity: 1.3,
    battery: 81,
    loadWeight: 210,
    emergencyStatus: false,
    task: { id: "TSK-805", type: "Place", destination: [30, 260], targetRack: "RACK C1", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 9.2,
    priorityAge: 0,
    agedPriorityScore: 9.2,
    commMode: "mesh",
    lastServerContact: Date.now(),
    trustState: "verified",
    hmacValid: true,
    seq: 1180,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_005,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
  {
    id: "AMR_006",
    position: { x: 520, y: 25 },
    heading: 180,
    velocity: 1.4,
    battery: 95,
    loadWeight: 100,
    emergencyStatus: false,
    task: { id: "TSK-806", type: "Pick", destination: [345, 140], targetRack: "RACK B3", status: "active" },
    dwellTimer: 0,
    completedTaskCount: 0,
    priorityScore: 7.8,
    priorityAge: 0,
    agedPriorityScore: 7.8,
    commMode: "central",
    lastServerContact: Date.now(),
    trustState: "verified",
    hmacValid: true,
    seq: 2890,
    nhOrcaActive: false,
    blockedAisleAlert: null,
    path: AISLE_ROUTES.AMR_006,
    currentWaypointIndex: 0,
    statusState: "Moving",
    waitingForAmrId: null,
    junctionId: null,
  },
];

function compareAMRs(amrA: AMR, amrB: AMR): { winnerId: string; yielderId: string } {
  try {
    console.error("[NEGOTIATION FUNCTION ENTERED]", {
      amrA: { id: amrA.id, pos: amrA.position, agedScore: amrA.agedPriorityScore, age: amrA.priorityAge, status: amrA.statusState },
      amrB: { id: amrB.id, pos: amrB.position, agedScore: amrB.agedPriorityScore, age: amrB.priorityAge, status: amrB.statusState },
    });
  } catch (e) {
    // Ignore logging errors
  }

  // STATION CLEARANCE OVERRIDE: AMR at/leaving station, executing task, or charging gets HIGHEST priority
  const amrAAtStation = dist(amrA.position, { x: 30, y: 380 }) < 35 || amrA.statusState === "Task Execution" || amrA.statusState === "Charging";
  const amrBAtStation = dist(amrB.position, { x: 30, y: 380 }) < 35 || amrB.statusState === "Task Execution" || amrB.statusState === "Charging";

  if (amrAAtStation && !amrBAtStation) return { winnerId: amrA.id, yielderId: amrB.id };
  if (amrBAtStation && !amrAAtStation) return { winnerId: amrB.id, yielderId: amrA.id };

  const scoreA = amrA.agedPriorityScore;
  const scoreB = amrB.agedPriorityScore;

  if (Math.abs(scoreA - scoreB) > 0.001) {
    return scoreA > scoreB
      ? { winnerId: amrA.id, yielderId: amrB.id }
      : { winnerId: amrB.id, yielderId: amrA.id };
  }

  // Strict deterministic tie-break: lower AMR ID wins
  return amrA.id < amrB.id
    ? { winnerId: amrA.id, yielderId: amrB.id }
    : { winnerId: amrB.id, yielderId: amrA.id };
}

class MockSimulationEngine {
  private timer: number | null = null;
  private currentAMRs: AMR[] = [];
  private taskQueue: TaskQueueItem[] = [...INITIAL_TASKS];
  private taskKpis: TaskKPI[] = [
    { taskId: "TSK-701", robotId: "AMR_001", totalLatency: 32, activeTravelTime: 26, idleWaitTime: 6 },
    { taskId: "TSK-702", robotId: "AMR_002", totalLatency: 45, activeTravelTime: 38, idleWaitTime: 7 },
    { taskId: "TSK-703", robotId: "AMR_004", totalLatency: 28, activeTravelTime: 24, idleWaitTime: 4 },
  ];
  private anomalies: AnomalyCounters = { sequenceGaps: 0, hmacFailures: 0, staleRejections: 0 };
  private stepCount = 0;
  private haltStartTimes: Record<string, number> = {};
  private lastReplanTimes: Record<string, number> = {};
  private lastRerouteEvents: Record<string, { nodeId: string; time: number; pos: Position }> = {};

  constructor() {
    this.currentAMRs = JSON.parse(JSON.stringify(initialAMRs));
  }

  public runDemoMission() {
    this.resetSimulation();
    this.start();
  }

  public resetSimulation() {
    this.currentAMRs = JSON.parse(JSON.stringify(initialAMRs));
    this.taskQueue = JSON.parse(JSON.stringify(INITIAL_TASKS));
    this.taskKpis = [
      { taskId: "TSK-701", robotId: "AMR_001", totalLatency: 32, activeTravelTime: 26, idleWaitTime: 6 },
      { taskId: "TSK-702", robotId: "AMR_002", totalLatency: 45, activeTravelTime: 38, idleWaitTime: 7 },
      { taskId: "TSK-703", robotId: "AMR_004", totalLatency: 28, activeTravelTime: 24, idleWaitTime: 4 },
    ];
    this.anomalies = { sequenceGaps: 0, hmacFailures: 0, staleRejections: 0 };
    this.stepCount = 0;
    this.haltStartTimes = {};
    this.lastReplanTimes = {};
    this.lastRerouteEvents = {};
    useFleetStore.getState().updateFleetState({
      amrs: this.currentAMRs,
      taskQueue: this.taskQueue,
      taskKpis: this.taskKpis,
      events: [],
      peerPackets: [],
      anomalies: this.anomalies,
    });
  }

  private isBlockedByOther(amrId: string, candidatePos: Position, safetyDist: number): boolean {
    for (const otherAmr of this.currentAMRs) {
      if (otherAmr.id === amrId) continue;
      const candidateDist = dist(candidatePos, otherAmr.position);
      if (candidateDist < safetyDist) {
        return true;
      }
    }
    return false;
  }

  public start() {
    if (this.timer) return;
    
    useFleetStore.getState().updateFleetState({
      amrs: this.currentAMRs,
      taskQueue: this.taskQueue,
      taskKpis: this.taskKpis,
      events: [
        {
          id: `EVT-INIT-1-${Date.now()}`,
          timestamp: getFormattedTimestamp(),
          category: "connectivity",
          text: "Central Fleet coordination active: Deterministic Aisle Traffic, Priority Right-of-Way Arbitration, & Dynamic Rerouting operational.",
        },
        {
          id: `EVT-INIT-2-${Date.now()}`,
          timestamp: getFormattedTimestamp(),
          category: "task",
          text: "Shift task queue synchronized: 6 active tasks in execution, 2 tasks queued.",
        },
      ],
    });

    this.timer = window.setInterval(() => {
      if (useFleetStore.getState().isSimulationRunning) {
        this.tick();
      }
    }, 100);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public addInjectedTask(task: TaskQueueItem) {
    this.taskQueue.unshift(task);
    useFleetStore.getState().updateFleetState({
      amrs: this.currentAMRs,
      taskQueue: [...this.taskQueue],
    });
    useFleetStore.getState().addEvent({
      id: `EVT-TASK-ADD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: getFormattedTimestamp(),
      category: "task",
      text: `DISPATCH INJECT: New task ${task.id} (${task.type} @ ${task.targetRack}, Priority ${task.priority.toFixed(1)}) queued for execution.`,
    });
  }

  public registerAMR(data: {
    id: string;
    loadWeight: number;
    battery: number;
    startLocation: string;
    commMode: CommMode;
  }) {
    if (this.currentAMRs.some((a) => a.id.toUpperCase() === data.id.toUpperCase())) {
      return { success: false, message: `AMR with ID ${data.id} is already registered.` };
    }

    const amrKey = data.id.toUpperCase();
    const startPos: Position = getStagingPosition(amrKey, this.currentAMRs.length);

    const route = [
      { x: startPos.x, y: startPos.y },
    ];

    const newAmr: AMR = {
      id: amrKey,
      position: startPos,
      heading: 0,
      velocity: 1.4,
      battery: data.battery,
      loadWeight: data.loadWeight,
      emergencyStatus: false,
      task: null,
      dwellTimer: 0,
      completedTaskCount: 0,
      priorityScore: 7.0,
      priorityAge: 0,
      agedPriorityScore: 7.0,
      commMode: data.commMode,
      lastServerContact: Date.now(),
      trustState: "verified",
      hmacValid: true,
      seq: 100,
      nhOrcaActive: false,
      blockedAisleAlert: null,
      path: route,
      currentWaypointIndex: 0,
      statusState: "Moving",
      waitingForAmrId: null,
      junctionId: null,
      inDeadZone: false,
    };

    this.currentAMRs.push(newAmr);

    useFleetStore.getState().updateFleetState({
      amrs: [...this.currentAMRs],
    });

    useFleetStore.getState().addEvent({
      id: `EVT-REG-${Date.now()}`,
      timestamp: getFormattedTimestamp(),
      category: "connectivity",
      text: `FLEET REGISTRATION: New AMR ${amrKey} successfully onboarded into active fleet roster.`,
    });

    return { success: true, message: `AMR ${amrKey} registered successfully.` };
  }

  public toggleEmergencyStop(amrId: string) {
    const amr = this.currentAMRs.find((a) => a.id === amrId);
    if (!amr) return;

    amr.emergencyStatus = !amr.emergencyStatus;
    if (amr.emergencyStatus) {
      amr.velocity = 0;
      amr.statusState = "Yielding";
      useFleetStore.getState().addEvent({
        id: `EVT-ESTOP-${Date.now()}-${amr.id}`,
        timestamp: getFormattedTimestamp(),
        category: "deadlock",
        text: `EMERGENCY STOP ACTIVATED: Manual e-stop triggered on ${amr.id}. Motion halted instantly.`,
      });
    } else {
      amr.statusState = "Moving";
      useFleetStore.getState().addEvent({
        id: `EVT-ESTOP-CLR-${Date.now()}-${amr.id}`,
        timestamp: getFormattedTimestamp(),
        category: "task",
        text: `EMERGENCY STOP CLEARED: ${amr.id} restored to active operational status.`,
      });
    }

    useFleetStore.getState().updateFleetState({ amrs: [...this.currentAMRs] });
  }

  public forceReroute(amrId: string) {
    const amr = this.currentAMRs.find((a) => a.id === amrId);
    if (!amr) return;

    const goal = amr.task && amr.task.destination
      ? { x: amr.task.destination[0], y: amr.task.destination[1] }
      : getStagingPosition(amr.id, 0);

    const result = runDLiteReroute(amr.position, goal, "N_195_140");
    amr.path = result.path;
    amr.currentWaypointIndex = 0;
    amr.nhOrcaActive = true;

    useFleetStore.getState().addEvent({
      id: `EVT-MAN-REROUTE-${Date.now()}-${amr.id}`,
      timestamp: getFormattedTimestamp(),
      category: "reroute",
      text: `MANUAL RE-ROUTE AUDIT: Path recalculated for ${amr.id} via aisle detour (Replan latency: ${result.replanLatencyMs}ms).`,
    });

    useFleetStore.getState().updateFleetState({ amrs: [...this.currentAMRs] });
  }

  public auditHmacPacket(amrId: string) {
    const amr = this.currentAMRs.find((a) => a.id === amrId);
    if (!amr) return;

    amr.seq += 1;
    amr.hmacValid = true;
    amr.trustState = "verified";

    useFleetStore.getState().addEvent({
      id: `EVT-HMAC-AUDIT-${Date.now()}-${amr.id}`,
      timestamp: getFormattedTimestamp(),
      category: "security",
      text: `SECURITY PACKET AUDIT: Diagnostic HMAC signature verified for ${amr.id} (Seq #${amr.seq}). Trust Gate: PASSED.`,
    });

    useFleetStore.getState().updateFleetState({ amrs: [...this.currentAMRs] });
  }

  private tick() {
    try {
      this.stepCount++;
      const now = Date.now();
      const dt = 0.1;
      const generatedEvents: FleetEvent[] = [];
      const generatedPackets: PeerPacket[] = [];

// STEP 1: PRIORITY AGING & EFFECTIVE PRIORITY SCORE RECOMPUTATION ---
      for (const amr of this.currentAMRs) {
        const isHalted = (amr.haltReason && amr.haltReason !== null) || amr.statusState === "Yielding";
        if (isHalted) {
          amr.priorityAge = parseFloat((amr.priorityAge + dt).toFixed(1));
        } else if (amr.statusState === "Moving" || amr.statusState === "Charging" || amr.statusState === "Task Execution" || amr.statusState === "Idle") {
          if (amr.statusState === "Moving" && amr.waitingForAmrId === null) {
            amr.priorityAge = 0;
          }
        }

        const activeTaskObj = amr.task ? this.taskQueue.find((t) => t.id === amr.task!.id) : null;
        const activeTaskPriority = activeTaskObj ? activeTaskObj.priority : 5.0;
        const basePriority = computeBasePriority(activeTaskPriority, amr.loadWeight, amr.battery, amr.emergencyStatus);
        amr.priorityScore = basePriority;
        amr.agedPriorityScore = parseFloat((basePriority + amr.priorityAge * 1.5).toFixed(2));
      }

      // --- STEP 1B: PRIORITY CASCADE RESOLUTION & AUTO-RELEASE ---
      for (const amr of this.currentAMRs) {
        if (amr.waitingForAmrId || amr.haltReason === "priority") {
          const targetAmr = this.currentAMRs.find((a) => a.id === amr.waitingForAmrId);
          const isTargetIdleOrTask = targetAmr && (targetAmr.statusState === "Idle" || targetAmr.statusState === "Task Execution" || targetAmr.statusState === "Charging");
          const isTargetFar = targetAmr && dist(amr.position, targetAmr.position) > 55.0;
          const isTargetStuck = targetAmr && (targetAmr.haltReason !== null || targetAmr.statusState === "Yielding") && (targetAmr.haltDuration || 0) >= 3.0;

          if (!targetAmr || isTargetIdleOrTask || isTargetFar || isTargetStuck) {
            const oldTargetId = amr.waitingForAmrId;
            amr.waitingForAmrId = null;
            amr.haltReason = null;
            amr.statusState = "Moving";
            amr.priorityAge = 0;

            if (targetAmr && isTargetStuck) {
              generatedEvents.push({
                id: `EVT-CASCADE-REL-${now}-${amr.id}`,
                timestamp: getFormattedTimestamp(),
                category: "deadlock",
                text: `CASCADE RELEASE: ${amr.id} released from yielding to ${oldTargetId} (blocking AMR halted for ${(targetAmr.haltDuration || 0).toFixed(1)}s). Resuming travel.`,
              });
            }
          }
        }
      }

      // --- STEP 2: CBS CONFLICTS, CHOKEPOINTS & ORCA VECTORS ---
      const cbsConflicts = detectCBSConflicts(this.currentAMRs);
      const updatedChokepoints = updateChokepointStatus(this.currentAMRs);
      const orcaMap: Record<string, ReturnType<typeof computeNHORCA>> = {};
      for (const amr of this.currentAMRs) {
        orcaMap[amr.id] = computeNHORCA(amr, this.currentAMRs);
      }

      // --- STEP 3: DETERMINISTIC JUNCTION ARBITRATION VIA SHARED COMPARATOR ---
      const activeContentionWinners = new Set<string>();
      const activeContentionYielders = new Map<string, string>(); // yielderId -> winnerId

      for (let i = 0; i < this.currentAMRs.length; i++) {
        for (let j = i + 1; j < this.currentAMRs.length; j++) {
          const amrA = this.currentAMRs[i];
          const amrB = this.currentAMRs[j];
          const distance = dist(amrA.position, amrB.position);

          if (distance < 28.0) {
            const outcome = compareAMRs(amrA, amrB);
            activeContentionWinners.add(outcome.winnerId);
            activeContentionYielders.set(outcome.yielderId, outcome.winnerId);
          }
        }
      }

      // Remove any winner from yielder map if it was set in a multi-robot contention
      for (const winnerId of activeContentionWinners) {
        if (activeContentionYielders.has(winnerId)) {
          activeContentionYielders.delete(winnerId);
        }
      }

      // --- STEP 4: MUTUAL YIELD DEV ASSERTION CHECK ---
      for (let i = 0; i < this.currentAMRs.length; i++) {
        for (let j = i + 1; j < this.currentAMRs.length; j++) {
          const amrA = this.currentAMRs[i];
          const amrB = this.currentAMRs[j];
          if (dist(amrA.position, amrB.position) < 45.0) {
            if (amrA.waitingForAmrId === amrB.id && amrB.waitingForAmrId === amrA.id) {
              generatedEvents.push({
                id: `EVT-MUTUAL-YIELD-${now}-${amrA.id}-${amrB.id}`,
                timestamp: getFormattedTimestamp(),
                category: "system",
                text: `INVARIANT VIOLATION: mutual yield between ${amrA.id} and ${amrB.id}`,
              });
            }
          }
        }
      }

      // --- STEP 5: PER-AMR UPDATE WITH INNER TRY/CATCH ---
      this.currentAMRs = this.currentAMRs.map((amr, idx) => {
        try {
          return this.updateSingleAMR(
            amr,
            idx,
            dt,
            now,
            activeContentionWinners,
            activeContentionYielders,
            generatedEvents
          );
        } catch (err: any) {
          generatedEvents.push({
            id: `EVT-AMR-ERR-${now}-${amr.id}`,
            timestamp: getFormattedTimestamp(),
            category: "system",
            text: `AMR UPDATE EXCEPTION on ${amr.id}: ${err?.message || String(err)}`,
          });
          return amr; // Return unchanged AMR state on error
        }
      });

      // --- STEP 6: GLOBAL STUCK-DETECTION WATCHDOG (8-SECOND SAFETY NET) ---
      for (let idx = 0; idx < this.currentAMRs.length; idx++) {
        const amr = this.currentAMRs[idx];
        const isHalted = amr.haltReason !== null || amr.statusState === "Yielding";

        if (isHalted && amr.statusState !== "Idle" && amr.statusState !== "Charging" && amr.statusState !== "Task Execution") {
          if (!this.haltStartTimes[amr.id]) {
            this.haltStartTimes[amr.id] = now;
          }
          const elapsedSec = (now - this.haltStartTimes[amr.id]) / 1000;
          amr.haltDuration = parseFloat(elapsedSec.toFixed(1));

          if (elapsedSec >= 8.0) {
            // WATCHDOG FORCED RECOVERY ACTION
            const reasonLabel = amr.haltReason || "yielding";
            amr.priorityAge += 15.0;
            amr.waitingForAmrId = null;
            amr.haltReason = null;
            amr.statusState = "Moving";

            const goal = amr.task && amr.task.destination
              ? { x: amr.task.destination[0], y: amr.task.destination[1] }
              : getStagingPosition(amr.id, idx);

            amr.path = buildSafeAislePath(amr.position, goal, "N_195_140");
            amr.currentWaypointIndex = getNextWaypointIndex(amr.path, amr.position);
            this.haltStartTimes[amr.id] = now;
            amr.haltDuration = 0;

            generatedEvents.push({
              id: `EVT-WATCHDOG-${now}-${amr.id}`,
              timestamp: getFormattedTimestamp(),
              category: "system",
              text: `STUCK RECOVERY: ${amr.id} forced to recover after ${Math.floor(elapsedSec)} seconds halted (reason: ${reasonLabel})`,
            });
          }
        } else {
          delete this.haltStartTimes[amr.id];
          amr.haltDuration = 0;
        }
      }

      // 1-Second Console Watchdog Audit
      if (this.stepCount % 10 === 0) {
        console.log(
          "[AMR FLEET WATCHDOG]",
          this.currentAMRs.map((a) => `${a.id}:${a.statusState}(reason=${a.haltReason || "none"},dur=${a.haltDuration || 0}s,wait=${a.waitingForAmrId || "none"})`).join(" | ")
        );
      }

      // --- STEP 7: PEER MESH TELEMETRY PACKETS ---
      if (this.stepCount % 5 === 0) {
        const activeMeshAMRs = this.currentAMRs.filter((a) => a.commMode !== "central" || Math.random() > 0.4);
        if (activeMeshAMRs.length >= 2) {
          const sender = activeMeshAMRs[Math.floor(Math.random() * activeMeshAMRs.length)];
          const isHmacOk = Math.random() > 0.06;
          const isFresh = Math.random() > 0.04;
          const isRelevance = true;
          const isTrust = isHmacOk && isFresh;
          const isBenefit = true;

          if (!isHmacOk) this.anomalies.hmacFailures++;
          if (!isFresh) this.anomalies.staleRejections++;
          if (Math.random() < 0.03) this.anomalies.sequenceGaps++;

          const packet: PeerPacket = {
            id: `PKT-${now}-${sender.id}`,
            timestamp: getFormattedTimestamp(),
            senderId: sender.id,
            seq: sender.seq,
            hmacValid: isHmacOk,
            trustGate: {
              relevance: isRelevance,
              freshness: isFresh,
              trust: isTrust,
              benefit: isBenefit,
            },
            trustState: isHmacOk && isFresh ? "verified" : !isFresh ? "stale" : "unverified",
            ageMs: Math.floor(10 + Math.random() * 25),
          };
          generatedPackets.push(packet);
        }
      }

      // --- STEP 8: D* LITE REROUTE & OBSTACLE EVENT WITH COOLDOWN ---
      if (this.stepCount % 180 === 40) {
        const amrToBlock = this.currentAMRs[0];
        const obstacleNodeId = "N_195_140";
        amrToBlock.blockedAisleAlert = {
          nodeId: "J-06",
          type: "static",
          aisleName: "AISLE 1 (Junction X=195, Y=140)",
        };
        const dLiteResult = runDLiteReroute(
          amrToBlock.position,
          amrToBlock.task && amrToBlock.task.destination
            ? { x: amrToBlock.task.destination[0], y: amrToBlock.task.destination[1] }
            : { x: 30, y: 260 },
          obstacleNodeId
        );

        amrToBlock.path = dLiteResult.path;
        amrToBlock.currentWaypointIndex = 0;
        amrToBlock.nhOrcaActive = true;

        // Per-obstacle cooldown check
        const lastReroute = this.lastRerouteEvents[amrToBlock.id];
        const shouldLogReroute = !lastReroute ||
          lastReroute.nodeId !== obstacleNodeId ||
          (now - lastReroute.time >= 5000) ||
          dist(amrToBlock.position, lastReroute.pos) >= 15.0;

        if (shouldLogReroute) {
          this.lastRerouteEvents[amrToBlock.id] = {
            nodeId: obstacleNodeId,
            time: now,
            pos: { ...amrToBlock.position },
          };

          generatedEvents.push({
            id: `EVT-REROUTE-${now}`,
            timestamp: getFormattedTimestamp(),
            category: "reroute",
            text: `${amrToBlock.id} detected static obstacle at junction ${obstacleNodeId}. Dynamic path planning generated detour along Top Aisle Y=25 to Aisle 2 X=345 (Replan latency: ${dLiteResult.replanLatencyMs}ms).`,
          });
        }

        setTimeout(() => {
          if (this.currentAMRs[0]) {
            this.currentAMRs[0].blockedAisleAlert = null;
            this.currentAMRs[0].nhOrcaActive = false;
          }
        }, 7000);
      }

      useFleetStore.getState().updateFleetState({
        amrs: this.currentAMRs,
        events: generatedEvents.length > 0 ? generatedEvents : undefined,
        peerPackets: generatedPackets.length > 0 ? generatedPackets : undefined,
        taskQueue: this.taskQueue,
        taskKpis: this.taskKpis,
        anomalies: this.anomalies,
        cbsConflicts: cbsConflicts.length > 0 ? cbsConflicts : undefined,
        chokepoints: updatedChokepoints,
        orcaVectors: orcaMap,
      });

    } catch (err: any) {
      useFleetStore.getState().addEvent({
        id: `EVT-SYS-ERR-${Date.now()}`,
        timestamp: getFormattedTimestamp(),
        category: "system",
        text: `SYSTEM EXCEPTION: ${err?.message || String(err)}`,
      });
    }
  }

  private updateSingleAMR(
    amr: AMR,
    idx: number,
    dt: number,
    now: number,
    activeContentionWinners: Set<string>,
    activeContentionYielders: Map<string, string>,
    generatedEvents: FleetEvent[]
  ): AMR {
    let {
      position,
      heading,
      velocity,
      battery,
      commMode,
      priorityAge,
      emergencyStatus,
      loadWeight,
      dwellTimer,
      completedTaskCount,
      task,
      currentWaypointIndex,
      statusState,
    } = amr;

    const isWinner = activeContentionWinners.has(amr.id);
    const blockingWinnerId = activeContentionYielders.get(amr.id);
    const winnerAmr = blockingWinnerId ? this.currentAMRs.find((a) => a.id === blockingWinnerId) : null;

    if (blockingWinnerId && !isWinner && winnerAmr) {
      // --- YIELDING AMR: Decelerate, step back / make space, or dynamic reroute ---
      statusState = "Yielding";
      amr.nhOrcaActive = true;
      amr.haltReason = "priority";
      priorityAge += dt; // Increment priority age every tick while yielding

      if (amr.waitingForAmrId !== blockingWinnerId) {
        amr.waitingForAmrId = blockingWinnerId;

        generatedEvents.push({
          id: `EVT-YIELD-${now}-${amr.id}`,
          timestamp: getFormattedTimestamp(),
          category: "negotiation",
          text: `JUNCTION ARBITRATION: ${amr.id} holding at aisle clearance buffer, yielding right-of-way to ${blockingWinnerId} (Priority: ${winnerAmr.agedPriorityScore.toFixed(2)} vs ${amr.agedPriorityScore.toFixed(2)}).`,
        });
      }

      // 1. REPLAN DETOUR: Attempt D* Lite reroute around winner's junction node if possible
      const lastReplan = this.lastReplanTimes[amr.id] || 0;
      const canReplan = (now - lastReplan) >= 1200;

      if (canReplan) {
        const goalPos = amr.task && amr.task.destination
          ? { x: amr.task.destination[0], y: amr.task.destination[1] }
          : getStagingPosition(amr.id, idx);

        const winnerNodeId = `N_${Math.round(winnerAmr.position.x)}_${Math.round(winnerAmr.position.y)}`;
        const reroute = runDLiteReroute(position, goalPos, winnerNodeId);
        this.lastReplanTimes[amr.id] = now;

        if (reroute.path && reroute.path.length > 1) {
          amr.path = reroute.path;
          currentWaypointIndex = getNextWaypointIndex(amr.path, position);

          const lastLog = this.lastRerouteEvents[amr.id];
          const shouldLog = !lastLog || lastLog.nodeId !== winnerNodeId || (now - lastLog.time) >= 5000;
          if (shouldLog) {
            this.lastRerouteEvents[amr.id] = { nodeId: winnerNodeId, time: now, pos: { ...position } };
            generatedEvents.push({
              id: `EVT-DYNAMIC-REROUTE-${now}-${amr.id}`,
              timestamp: getFormattedTimestamp(),
              category: "reroute",
              text: `JUNCTION REROUTE: ${amr.id} (Priority: ${amr.agedPriorityScore.toFixed(2)}) recalculated detour path around yielding bottleneck at ${winnerNodeId}.`,
            });
          }
        }
      }

      // 2. ACTIVE SPACE-MAKING / STEP BACK: If yielder is within 35px of winner, step back away from winner
      const dToWinner = dist(position, winnerAmr.position);
      if (dToWinner < 35.0) {
        const dx = position.x - winnerAmr.position.x;
        const dy = position.y - winnerAmr.position.y;
        let stepX = position.x;
        let stepY = position.y;

        if (Math.abs(dx) > Math.abs(dy)) {
          stepX += Math.sign(dx || 1) * 1.2;
        } else {
          stepY += Math.sign(dy || 1) * 1.2;
        }

        const candidateStep = { x: stepX, y: stepY };
        if (!isInsideAnyRack(candidateStep)) {
          position = candidateStep;
          velocity = 0.5;
        } else {
          velocity = 0;
        }
      } else {
        velocity = 0;
      }
    } else {
      // --- WINNER OR CLEAR AMR: Proceed along deterministic route ---
      if (amr.waitingForAmrId !== null) {
        generatedEvents.push({
          id: `EVT-RELEASE-${now}-${amr.id}`,
          timestamp: getFormattedTimestamp(),
          category: "deadlock",
          text: `JUNCTION RESOLVED VIA PRIORITY AGING: ${amr.id} aged priority score ${amr.agedPriorityScore.toFixed(2)} granted right-of-way. Resuming aisle passage.`,
        });
        amr.waitingForAmrId = null;
        amr.priorityAge = 0;
      }

      if (dwellTimer > 0) {
        statusState = "Task Execution";
        velocity = 0;
        dwellTimer = Math.max(0, dwellTimer - dt);

        if (dwellTimer <= 0 && task) {
          completedTaskCount++;
          statusState = "Moving";

          if (task.type === "Pick") {
            loadWeight = Math.floor(180 + Math.random() * 300);
          } else if (task.type === "Place") {
            loadWeight = 0;
          }

          const taskInQueue = this.taskQueue.find((t) => t.id === task?.id);
          if (taskInQueue) {
            taskInQueue.status = "complete";
            taskInQueue.completedAt = getFormattedTimestamp();

            const totalLatency = Math.floor(25 + Math.random() * 20);
            const activeTravelTime = Math.floor(18 + Math.random() * 12);
            const idleWaitTime = Math.floor(3 + Math.random() * 6);

            this.taskKpis = [
              {
                taskId: taskInQueue.id,
                robotId: amr.id,
                totalLatency,
                activeTravelTime,
                idleWaitTime,
              },
              ...this.taskKpis,
            ].slice(0, 50);
          }

          generatedEvents.push({
            id: `EVT-TASK-${now}-${amr.id}`,
            timestamp: getFormattedTimestamp(),
            category: "task",
            text: `TASK DONE: ${amr.id} successfully finished ${task.type} task at ${task.targetRack || "Rack"}. Total tasks completed: ${completedTaskCount}.`,
          });

          if (battery < 30.0) {
            task = null;
            amr.path = buildOperationalRoute(position, CHARGING_STATION, amr.blockedAisleAlert?.nodeId);
            currentWaypointIndex = 0;

            generatedEvents.push({
              id: `EVT-BAT-${now}-${idx}`,
              timestamp: getFormattedTimestamp(),
              category: "task",
              text: `LOW BATTERY ALERT: ${amr.id} finished active task. Battery at ${battery.toFixed(1)}% (<30%). Routing to Charging Station (BAY-1) before accepting next tasks.`,
            });
          } else {
            const nextQueuedTask = this.taskQueue.find((t) => t.status === "queued");

            if (nextQueuedTask) {
              nextQueuedTask.status = "active";
              nextQueuedTask.assignedAmrId = amr.id;

              const rackDest = RACK_AISLE_DESTINATIONS[nextQueuedTask.targetRack] || { x: 195, y: 140 };

              task = {
                id: nextQueuedTask.id,
                type: nextQueuedTask.type,
                targetRack: nextQueuedTask.targetRack,
                destination: [rackDest.x, rackDest.y],
                status: "active",
              };

              amr.path = buildOperationalRoute(position, { x: rackDest.x, y: rackDest.y }, amr.blockedAisleAlert?.nodeId);
              currentWaypointIndex = 0;

              generatedEvents.push({
                id: `EVT-ASSIGN-${now}-${amr.id}`,
                timestamp: getFormattedTimestamp(),
                category: "task",
                text: `TASK DISPATCH: ${amr.id} assigned next task ${task.id} (${task.type} @ ${task.targetRack}).`,
              });
            } else {
              task = null;
              const stagingPos = getStagingPosition(amr.id, idx);
              amr.path = buildOperationalRoute(position, stagingPos, amr.blockedAisleAlert?.nodeId);
              currentWaypointIndex = 0;

              generatedEvents.push({
                id: `EVT-IDLE-${now}-${amr.id}`,
                timestamp: getFormattedTimestamp(),
                category: "task",
                text: `RETURN TO PARKING: ${amr.id} completed assigned tasks. Returning to parking slot (${stagingPos.x}, ${stagingPos.y}) beside Charging Station.`,
              });
            }
          }
        }
      } else {
        if (!task && statusState !== "Charging" && battery >= 30.0) {
          const nextQueuedTask = this.taskQueue.find((t) => t.status === "queued");
          if (nextQueuedTask) {
            nextQueuedTask.status = "active";
            nextQueuedTask.assignedAmrId = amr.id;

            const rackDest = RACK_AISLE_DESTINATIONS[nextQueuedTask.targetRack] || { x: 195, y: 140 };
            task = {
              id: nextQueuedTask.id,
              type: nextQueuedTask.type,
              targetRack: nextQueuedTask.targetRack,
              destination: [rackDest.x, rackDest.y],
              status: "active",
            };
            statusState = "Moving";
            amr.path = buildOperationalRoute(position, { x: rackDest.x, y: rackDest.y }, amr.blockedAisleAlert?.nodeId);
            currentWaypointIndex = 0;

            generatedEvents.push({
              id: `EVT-DISPATCH-${now}-${amr.id}`,
              timestamp: getFormattedTimestamp(),
              category: "task",
              text: `DISPATCH FROM PARKING: ${amr.id} departing parking bay slot (${Math.round(position.x)}, ${Math.round(position.y)}) for task ${task.id} (${task.type} @ ${task.targetRack}).`,
            });
          }
        }

        const stagingPos = getStagingPosition(amr.id, idx);
        const chargingDockPos = getChargingDockPosition(amr.id, idx);
        let targetDest: Position;

        const activeChargingCount = this.currentAMRs.filter(
          (other) => other.id !== amr.id && other.statusState === "Charging"
        ).length;

        const isChargingBayFull = activeChargingCount >= 3;

        if (task && task.destination) {
          targetDest = { x: task.destination[0], y: task.destination[1] };
        } else if (battery < 30.0 && statusState !== "Charging") {
          targetDest = isChargingBayFull ? stagingPos : chargingDockPos;
        } else if (statusState === "Charging") {
          targetDest = position;
        } else {
          targetDest = stagingPos;
        }

        let activeRoute: Position[] = [];
        const distToGoal = dist(position, targetDest);

        if (statusState === "Charging") {
          velocity = 0;
          activeRoute = [position];
          amr.path = activeRoute;
          battery = Math.min(100, battery + 1.5);

          if (battery >= 98.0) {
            battery = 100;
            statusState = "Moving";
            amr.path = buildSafeAislePath(position, stagingPos, amr.blockedAisleAlert?.nodeId);
            currentWaypointIndex = 0;

            generatedEvents.push({
              id: `EVT-BAT-${now}-${idx}`,
              timestamp: getFormattedTimestamp(),
              category: "task",
              text: `CHARGING COMPLETE: ${amr.id} battery fully replenished (100%). Ready for task dispatch.`,
            });
          }
        } else if (task && distToGoal < 16.0) {
          if (dwellTimer <= 0) dwellTimer = 3.5;
          statusState = "Task Execution";
          velocity = 0;
          activeRoute = amr.path && amr.path.length > 0 ? amr.path : [position];
        } else if (battery < 30.0 && distToGoal < 18.0) {
          position = targetDest;
          statusState = "Charging";
          velocity = 0;
          battery = Math.min(100, battery + 1.5);
          activeRoute = [targetDest];
          amr.path = activeRoute;
        } else if (!task && distToGoal < 6.0) {
          position = targetDest;
          velocity = 0;
          heading = 0;
          statusState = "Idle";
          activeRoute = [targetDest];
          amr.path = activeRoute;
          currentWaypointIndex = 0;
        } else {
          statusState = "Moving";
          velocity = 1.4 + (idx * 0.1);

          const needsPathUpdate = !amr.path || amr.path.length <= 1 ||
            Math.abs(amr.path[amr.path.length - 1].x - targetDest.x) > 3 ||
            Math.abs(amr.path[amr.path.length - 1].y - targetDest.y) > 3;

          if (needsPathUpdate) {
            amr.path = buildSafeAislePath(position, targetDest, amr.blockedAisleAlert?.nodeId);
            currentWaypointIndex = 0;
          }
          activeRoute = amr.path;
        }

        const targetWaypoint = activeRoute[currentWaypointIndex % activeRoute.length] || activeRoute[0] || position;

        const dx = targetWaypoint.x - position.x;
        const dy = targetWaypoint.y - position.y;
        const distanceToWaypoint = Math.sqrt(dx * dx + dy * dy);

        if (distanceToWaypoint < 5.0) {
          if (dwellTimer <= 0) {
            if (currentWaypointIndex < activeRoute.length - 1) {
              currentWaypointIndex++;
            }
          }
        } else {
          const moveSpeed = velocity * 1.5;
          let nextX = position.x;
          let nextY = position.y;

          if (Math.abs(dx) > 2.0) {
            nextX += Math.sign(dx) * Math.min(moveSpeed, Math.abs(dx));
          } else if (Math.abs(dy) > 2.0) {
            nextY += Math.sign(dy) * Math.min(moveSpeed, Math.abs(dy));
          }

          let candidatePos = { x: nextX, y: nextY };

          // STRICT PHYSICAL OVERLAP GUARD (Minimum 22px center distance for physical chassis touch boundary)
          const SAFETY_DIST = 22.0;
          let isPathBlocked = false;
          let blockingAmr: AMR | null = null;

          for (const otherAmr of this.currentAMRs) {
            if (otherAmr.id === amr.id) continue;
            const currentDist = dist(position, otherAmr.position);
            const candidateDist = dist(candidatePos, otherAmr.position);

            // Block movement if candidate position gets closer than SAFETY_DIST (22px) and distance is NOT growing
            if (candidateDist < SAFETY_DIST && candidateDist <= currentDist) {
              isPathBlocked = true;
              blockingAmr = otherAmr;
              break;
            }
          }

          // DUAL-LANE PASSING CORRIDOR: If primary track is blocked/tight, switch to lane-2 lateral offset (+/- 14px)
          if (isPathBlocked && blockingAmr) {
            const laneOffset = 14.0;
            let dualLanePos: Position | null = null;

            if (Math.abs(dx) >= Math.abs(dy)) {
              // Moving horizontally along aisle: try shifting Y up (+14) or down (-14) into dual lane 2
              const shiftYUp = { x: nextX, y: position.y + laneOffset };
              const shiftYDown = { x: nextX, y: position.y - laneOffset };

              if (!isInsideAnyRack(shiftYUp) && !this.isBlockedByOther(amr.id, shiftYUp, SAFETY_DIST)) {
                dualLanePos = shiftYUp;
              } else if (!isInsideAnyRack(shiftYDown) && !this.isBlockedByOther(amr.id, shiftYDown, SAFETY_DIST)) {
                dualLanePos = shiftYDown;
              }
            } else {
              // Moving vertically along aisle: try shifting X right (+14) or left (-14) into dual lane 2
              const shiftXRight = { x: position.x + laneOffset, y: nextY };
              const shiftXLeft = { x: position.x - laneOffset, y: nextY };

              if (!isInsideAnyRack(shiftXRight) && !this.isBlockedByOther(amr.id, shiftXRight, SAFETY_DIST)) {
                dualLanePos = shiftXRight;
              } else if (!isInsideAnyRack(shiftXLeft) && !this.isBlockedByOther(amr.id, shiftXLeft, SAFETY_DIST)) {
                dualLanePos = shiftXLeft;
              }
            }

            if (dualLanePos) {
              candidatePos = dualLanePos;
              nextX = dualLanePos.x;
              nextY = dualLanePos.y;
              isPathBlocked = false;
              blockingAmr = null;
            }
          }

          if (isPathBlocked && blockingAmr) {
            // PHYSICAL BARRIER: Stop immediately and hold safe distance
            velocity = 0;
            statusState = "Yielding";
            amr.nhOrcaActive = true;
            amr.haltReason = amr.blockedAisleAlert ? "obstacle" : "priority";
            priorityAge += dt;

            // OBSTACLE/TRAFFIC REPLANNING: Retry D* Lite planning every 1.5s while halted
            const lastReplan = this.lastReplanTimes[amr.id] || 0;
            const canReplan = (now - lastReplan) >= 1500;

            if (canReplan) {
              const goalPos = amr.task && amr.task.destination
                ? { x: amr.task.destination[0], y: amr.task.destination[1] }
                : getStagingPosition(amr.id, idx);

              const blockedNodeId = amr.blockedAisleAlert
                ? amr.blockedAisleAlert.nodeId
                : `N_${Math.round(blockingAmr.position.x)}_${Math.round(blockingAmr.position.y)}`;

              const reroute = runDLiteReroute(position, goalPos, blockedNodeId);
              this.lastReplanTimes[amr.id] = now;

              if (reroute.path && reroute.path.length > 1) {
                amr.path = reroute.path;
                currentWaypointIndex = getNextWaypointIndex(amr.path, position);

                // LOGGING COOLDOWN IS INDEPENDENT OF REPLANNING ATTEMPTS!
                const lastLog = this.lastRerouteEvents[amr.id];
                const shouldLog = !lastLog || lastLog.nodeId !== blockedNodeId || (now - lastLog.time) >= 5000;

                if (shouldLog) {
                  this.lastRerouteEvents[amr.id] = { nodeId: blockedNodeId, time: now, pos: { ...position } };
                  generatedEvents.push({
                    id: `EVT-DYNAMIC-REROUTE-${now}-${amr.id}`,
                    timestamp: getFormattedTimestamp(),
                    category: "reroute",
                    text: `DYNAMIC REROUTE: ${amr.id} (Priority: ${amr.agedPriorityScore.toFixed(2)}) recalculated detour around blocked node ${blockedNodeId} to bypass aisle traffic.`,
                  });
                }
              }
            }
          } else if (!isInsideAnyRack(candidatePos)) {
            // Path is physically clear: advance to candidate position
            position = candidatePos;
            amr.haltReason = null;
          } else {
            // Stay strictly on clear aisle grid
            if (Math.abs(dx) > Math.abs(dy)) {
              if (!isInsideAnyRack({ x: nextX, y: position.y })) {
                position = { x: nextX, y: position.y };
              }
            } else {
              if (!isInsideAnyRack({ x: position.x, y: nextY })) {
                position = { x: position.x, y: nextY };
              }
            }
            amr.haltReason = null;
          }

          const angle = Math.atan2(dy, dx);
          heading = Math.round((angle * 180) / Math.PI + 360) % 360;
        }
      }
    }

    // Check Dead Zone Polygon
    const inDeadZone = pointInPolygon(position, DEAD_ZONE_POLYGON);
    let newCommMode = commMode;
    let trustState = amr.trustState;
    let lastContact = amr.lastServerContact;
    let isAmrInDeadZone = false;
    let lastKnownPos = amr.lastKnownServerPos;

    if (inDeadZone) {
      const meshPeer = this.currentAMRs.find(
        (other) => other.id !== amr.id && dist(position, other.position) < 160
      );

      if (meshPeer) {
        if (commMode !== "mesh") {
          newCommMode = "mesh";
          trustState = "verified";
          generatedEvents.push({
            id: `EVT-COMM-${now}-${idx}`,
            timestamp: getFormattedTimestamp(),
            category: "connectivity",
            text: `${amr.id} established peer mesh link with ${meshPeer.id} inside dead zone.`,
          });
        }
        isAmrInDeadZone = false;
        lastKnownPos = undefined;
      } else {
        isAmrInDeadZone = true;
        if (!lastKnownPos) {
          lastKnownPos = { ...position };
        }
        if (commMode !== "isolated") {
          newCommMode = "isolated";
          trustState = "stale";
          generatedEvents.push({
            id: `EVT-COMM-${now}-${idx}`,
            timestamp: getFormattedTimestamp(),
            category: "connectivity",
            text: `${amr.id} entered dead zone polygon without server link. Live telemetry disconnected on Central Dashboard.`,
          });
        }
      }
    } else {
      isAmrInDeadZone = false;
      lastKnownPos = undefined;
      if (commMode !== "central") {
        newCommMode = "central";
        trustState = "verified";
        lastContact = now;
        generatedEvents.push({
          id: `EVT-COMM-${now}-${idx}`,
          timestamp: getFormattedTimestamp(),
          category: "connectivity",
          text: `${amr.id} reconnected to Central Server upon exiting dead zone. Resuming live telemetry stream.`,
        });
      } else {
        lastContact = now;
      }
    }

    // IDLE LOW-BATTERY AUTO-DOCKING (<20%)
    if (statusState === "Idle" && battery < 20.0 && task === null) {
      task = {
        id: `TSK-AUTODOCK-${now}`,
        type: "Charge",
        destination: [30, 380],
        targetRack: "BAY-1",
        status: "active",
      };
      statusState = "Moving";
      amr.path = buildOperationalRoute(position, CHARGING_STATION, amr.blockedAisleAlert?.nodeId);
      currentWaypointIndex = 0;

      generatedEvents.push({
        id: `EVT-IDLE-DOCK-${now}-${idx}`,
        timestamp: getFormattedTimestamp(),
        category: "task",
        text: `LOW BATTERY AUTO-DOCK: ${amr.id} (Battery at ${battery.toFixed(1)}% < 20%) dispatched from parking to Charging Station (BAY-1).`,
      });
    }

    // DYNAMIC BATTERY DRAIN: ONLY APPLIES WHEN MOVING OR EXECUTING TASKS
    if (battery > 0 && statusState !== "Charging") {
      if (statusState === "Moving" || statusState === "Task Execution") {
        const baseRate = 0.04;
        const weightMultiplier = 1.0 + (loadWeight / 300.0);
        const taskStateMultiplier = statusState === "Task Execution" ? 1.8 : 1.2;
        const dynamicDrain = baseRate * weightMultiplier * taskStateMultiplier;
        battery = Math.max(0, battery - dynamicDrain);
      }
    }

    const activeTaskObj = task ? this.taskQueue.find((t) => t.id === task.id) : null;
    const activeTaskPriority = activeTaskObj ? activeTaskObj.priority : 5.0;
    const basePriority = computeBasePriority(activeTaskPriority, loadWeight, battery, emergencyStatus);
    const agedPriority = parseFloat((basePriority + priorityAge * 1.5).toFixed(2));

    return {
      ...amr,
      position,
      heading,
      velocity,
      battery: parseFloat(battery.toFixed(1)),
      commMode: newCommMode,
      trustState,
      lastServerContact: lastContact,
      priorityAge: parseFloat(priorityAge.toFixed(1)),
      priorityScore: basePriority,
      agedPriorityScore: agedPriority,
      seq: amr.seq + 1,
      dwellTimer: parseFloat(dwellTimer.toFixed(1)),
      completedTaskCount,
      task,
      currentWaypointIndex,
      statusState,
      haltReason: amr.haltReason,
      haltDuration: amr.haltDuration,
      inDeadZone: isAmrInDeadZone,
      lastKnownServerPos: lastKnownPos,
    };
  }
}

export const simulationEngine = new MockSimulationEngine();
