import { create } from "zustand";
import type { AMR, FleetEvent, PeerPacket, TaskQueueItem, TaskKPI, AnomalyCounters, EventCategory } from "../types/fleet";
import type { CBSConflict, ChokepointStatus, ORCAVector } from "../algorithms/coordinationEngine";
import { simulationEngine } from "../simulation/mockEngine";

export type NavTab = "overview" | "connectivity" | "tasks" | "kpi" | "security";

interface FleetStoreState {
  amrs: AMR[];
  events: FleetEvent[];
  peerPackets: PeerPacket[];
  taskQueue: TaskQueueItem[];
  taskKpis: TaskKPI[];
  anomalies: AnomalyCounters;
  cbsConflicts: CBSConflict[];
  chokepoints: ChokepointStatus[];
  orcaVectors: Record<string, ORCAVector>;
  activeTab: NavTab;
  selectedAmrId: string | null;
  auditModalAmrId: string | null;
  activeEventFilter: EventCategory | "all";
  isSimulationRunning: boolean;
  isRegisterModalOpen: boolean;
  isMapUploaderOpen: boolean;
  isTourOpen: boolean;
  tourStep: number;
  occupancyGridData: {
    metadata?: any;
    grid?: number[][];
    detected_racks?: any[];
  } | null;

  // Actions
  updateFleetState: (data: {
    amrs: AMR[];
    events?: FleetEvent[];
    peerPackets?: PeerPacket[];
    taskQueue?: TaskQueueItem[];
    taskKpis?: TaskKPI[];
    anomalies?: AnomalyCounters;
    cbsConflicts?: CBSConflict[];
    chokepoints?: ChokepointStatus[];
    orcaVectors?: Record<string, ORCAVector>;
  }) => void;
  addEvent: (event: FleetEvent) => void;
  addTask: (task: TaskQueueItem) => void;
  setActiveTab: (tab: NavTab) => void;
  setSelectedAmrId: (id: string | null) => void;
  setAuditModalAmrId: (id: string | null) => void;
  setEventFilter: (filter: EventCategory | "all") => void;
  toggleSimulation: () => void;
  runDemoMission: () => void;
  resetSimulation: () => void;
  setRegisterModalOpen: (open: boolean) => void;
  setMapUploaderOpen: (open: boolean) => void;
  setOccupancyGridData: (data: any) => void;
  setTourOpen: (open: boolean) => void;
  setTourStep: (step: number) => void;
}

export const useFleetStore = create<FleetStoreState>((set) => ({
  amrs: [],
  events: [],
  peerPackets: [],
  taskQueue: [],
  taskKpis: [],
  anomalies: {
    sequenceGaps: 0,
    hmacFailures: 0,
    staleRejections: 0,
  },
  cbsConflicts: [],
  chokepoints: [],
  orcaVectors: {},
  activeTab: "overview",
  selectedAmrId: null,
  auditModalAmrId: null,
  activeEventFilter: "all",
  isSimulationRunning: true,
  isRegisterModalOpen: false,
  isMapUploaderOpen: false,
  isTourOpen: false,
  tourStep: 1,
  occupancyGridData: null,

  updateFleetState: (data) =>
    set((state) => ({
      amrs: data.amrs ?? state.amrs,
      events: data.events ? [...data.events, ...state.events].slice(0, 150) : state.events,
      peerPackets: data.peerPackets ? [...data.peerPackets, ...state.peerPackets].slice(0, 50) : state.peerPackets,
      taskQueue: data.taskQueue ?? state.taskQueue,
      taskKpis: data.taskKpis ?? state.taskKpis,
      anomalies: data.anomalies ?? state.anomalies,
      cbsConflicts: data.cbsConflicts ? [...data.cbsConflicts, ...state.cbsConflicts].slice(0, 20) : state.cbsConflicts,
      chokepoints: data.chokepoints ?? state.chokepoints,
      orcaVectors: data.orcaVectors ?? state.orcaVectors,
    })),

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 150),
    })),

  addTask: (task) => {
    simulationEngine.addInjectedTask(task);
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedAmrId: (id) => set({ selectedAmrId: id }),
  setAuditModalAmrId: (id) => set({ auditModalAmrId: id }),
  setEventFilter: (filter) => set({ activeEventFilter: filter }),
  toggleSimulation: () => set((state) => ({ isSimulationRunning: !state.isSimulationRunning })),
  runDemoMission: () => {
    simulationEngine.runDemoMission();
    set({ isSimulationRunning: true });
  },
  resetSimulation: () => {
    simulationEngine.resetSimulation();
    set({ isSimulationRunning: false });
  },
  setRegisterModalOpen: (open) => set({ isRegisterModalOpen: open }),
  setMapUploaderOpen: (open) => set({ isMapUploaderOpen: open }),
  setOccupancyGridData: (data) => set({ occupancyGridData: data }),
  setTourOpen: (open) => set({ isTourOpen: open }),
  setTourStep: (step) => set({ tourStep: step }),
}));
