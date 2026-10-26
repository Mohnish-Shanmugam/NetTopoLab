export type NodeType = 'router' | 'switch' | 'host' | 'controller' | 'mesh_node';
export type NodeRole = 'core' | 'dist' | 'access' | 'host' | 'controller' | 'mesh';
export type NodeStatus = 'up' | 'down' | 'compromised' | 'supporting' | 'father';

export interface TopologyNode {
  id: string;
  label: string;
  type: NodeType;
  role: NodeRole;
  ip: string;
  mac: string;
  dpid?: string;
  x: number;
  y: number;
  status: NodeStatus;
  isSupportingSwitch?: boolean;
  isFatherNode?: boolean;
  subnet?: string;
  vlan?: number;
  trafficThroughputMbps?: number;
}

export type LinkStatus = 'up' | 'severed' | 'congested' | 'forged' | 'backup';

export interface TopologyLink {
  id: string;
  source: string; // node id
  target: string; // node id
  distanceMeters: number;
  delayMs: number;
  capacityMbps: number;
  currentFlowMbps: number;
  cost: number;
  status: LinkStatus;
  isSyntheticBypass?: boolean;
  isForged?: boolean;
}

export type PacketProtocol = 
  | 'OFDP' 
  | 'OFDPv2' 
  | 'Im-OFDP' 
  | 'sOFTDP-BFD' 
  | 'sOFTDP-LLDP'
  | 'SD-TDP' 
  | 'RIPv2' 
  | 'OSPFv2' 
  | 'EIGRP' 
  | 'IS-IS' 
  | 'ATTACK-SPOOF' 
  | 'ATTACK-RELAY'
  | 'MESH-DiffReq'
  | 'MESH-GathResp';

export interface PacketTrace {
  no: number;
  timeMs: number;
  source: string;
  destination: string;
  protocol: PacketProtocol;
  length: number;
  info: string;
  tlvPayload?: Record<string, string>;
  isMalicious?: boolean;
}

export interface ActivePacketAnimation {
  id: string;
  packetNo: number;
  sourceId: string;
  targetId: string;
  protocol: PacketProtocol;
  progress: number; // 0 to 1
  isMalicious?: boolean;
}

export type MainViewTab = 
  | 'topology_studio' 
  | 'sdn_discovery' 
  | 'security_lab' 
  | 'routing_mesh' 
  | 'export_center';

export type PresetKey = 'psu' | 'iiuc' | 'tree' | 'linear' | 'fattree' | 'geant';

export interface AttackScenario {
  id: string;
  name: string;
  target: string;
  description: string;
  attackerNode: string;
  victimNodes: string[];
  active: boolean;
  packetOutSignature: string;
  mitigation: string;
}

export interface DiscoveryProtocolMetrics {
  protocol: string;
  packetOut: number;
  packetIn: number;
  totalMessages: number;
  steadyStateMsgsPerSec: number;
  cpuLoad: string;
  convergenceTimeMs: number;
  efficiencyGainPct: number;
}

export interface RoutingComparisonRow {
  protocol: 'RIPv2' | 'OSPFv2' | 'EIGRP' | 'IS-IS';
  administrativeDistance: number;
  algorithm: string;
  convergenceSeconds: number;
  updateIntervalSec: number;
  rttMinAvgMaxMs: [number, number, number];
  throughputPacketsSec: [number, number];
  cpuMemoryOverhead: string;
  md5Supported: boolean;
}

export interface WirelessMeshSettings {
  txPowerDbm: -10 | -6 | -4;
  speedMps: number; // 0.0 to 2.0
  kFactor: number; // 1 to 5
  adaptiveK: boolean;
  panicMode: boolean;
  robustBroadcast: boolean; // DiffReq/DiffAck RTS/CTS
}
