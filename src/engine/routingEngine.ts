import { RoutingComparisonRow } from '../types';

export interface TrafficProfile {
  name: 'VoIP (G.711 PCM)' | 'Video Conferencing (H.264 HD)' | 'Campus Database Sync';
  packetSizePayloadBytes: number;
  maxTolerableDelayMs: number;
  jitterToleranceMs: number;
  bandwidthRequirementKbps: number;
}

export const TRAFFIC_PROFILES: Record<string, TrafficProfile> = {
  voip: {
    name: 'VoIP (G.711 PCM)',
    packetSizePayloadBytes: 160,
    maxTolerableDelayMs: 150,
    jitterToleranceMs: 30,
    bandwidthRequirementKbps: 64
  },
  video: {
    name: 'Video Conferencing (H.264 HD)',
    packetSizePayloadBytes: 1200,
    maxTolerableDelayMs: 250,
    jitterToleranceMs: 50,
    bandwidthRequirementKbps: 2500
  },
  db_sync: {
    name: 'Campus Database Sync',
    packetSizePayloadBytes: 1500,
    maxTolerableDelayMs: 600,
    jitterToleranceMs: 100,
    bandwidthRequirementKbps: 10000
  }
};

export const ROUTING_COMPARISON_DATA: RoutingComparisonRow[] = [
  {
    protocol: 'EIGRP',
    administrativeDistance: 90,
    algorithm: 'DUAL (Diffusing Update Algorithm)',
    convergenceSeconds: 1.8,
    updateIntervalSec: 5, // 5s hello, 15s hold-down
    rttMinAvgMaxMs: [36, 67, 184],
    throughputPacketsSec: [20, 50],
    cpuMemoryOverhead: 'Low (Partial bounded updates)',
    md5Supported: true
  },
  {
    protocol: 'OSPFv2',
    administrativeDistance: 110,
    algorithm: 'Dijkstra SPF (Link-State)',
    convergenceSeconds: 3.4,
    updateIntervalSec: 10, // 10s hello, 40s dead
    rttMinAvgMaxMs: [36, 74, 204],
    throughputPacketsSec: [15, 36],
    cpuMemoryOverhead: 'Medium (Periodic LSA flood + SPF recomputation)',
    md5Supported: true
  },
  {
    protocol: 'RIPv2',
    administrativeDistance: 120,
    algorithm: 'Bellman-Ford (Distance Vector)',
    convergenceSeconds: 12.5,
    updateIntervalSec: 30, // 30s update, 180s invalid/hold, 240s flush
    rttMinAvgMaxMs: [40, 147, 228],
    throughputPacketsSec: [14, 43],
    cpuMemoryOverhead: 'High (Full routing table periodic broadcast)',
    md5Supported: true
  },
  {
    protocol: 'IS-IS',
    administrativeDistance: 115,
    algorithm: 'Dijkstra (Link-State Protocol Data Unit)',
    convergenceSeconds: 2.9,
    updateIntervalSec: 9,
    rttMinAvgMaxMs: [35, 71, 192],
    throughputPacketsSec: [18, 42],
    cpuMemoryOverhead: 'Medium (Layer 2 native, highly scalable)',
    md5Supported: true
  }
];

export interface EndToEndDelayParams {
  hopCount: number;
  packetSizeBytes: number;
  linkCapacityMbps: number;
  propagationDistanceKm: number;
  qosEnabled: boolean;
}

/**
 * Computes exact end-to-end delay:
 * d_{end-end} = N * [ d_{trans} + d_{prop} + d_{proc} + d_{queue} ]
 */
export function calculateEndToEndDelay(params: EndToEndDelayParams): {
  transmissionDelayMs: number;
  propagationDelayMs: number;
  processingDelayMs: number;
  queuingDelayMs: number;
  totalDelayMs: number;
} {
  const { hopCount, packetSizeBytes, linkCapacityMbps, propagationDistanceKm, qosEnabled } = params;

  // d_trans = L / R (in seconds, convert to ms)
  const d_trans_ms = ((packetSizeBytes * 8) / (linkCapacityMbps * 1000000)) * 1000;
  
  // d_prop = d / s (speed of light in copper/fiber ~ 200,000 km/s -> 5 us / km = 0.005 ms / km)
  const d_prop_ms = (propagationDistanceKm * 0.005) / Math.max(1, hopCount);

  // d_proc = router lookup time ~ 0.05 ms per hop
  const d_proc_ms = 0.05;

  // d_queue = queuing delay. With QoS priority queue: ~0.15ms, with FIFO buffer: ~2.8ms
  const d_queue_ms = qosEnabled ? 0.15 : 2.80;

  const perHopMs = d_trans_ms + d_prop_ms + d_proc_ms + d_queue_ms;
  const totalDelayMs = perHopMs * hopCount;

  return {
    transmissionDelayMs: Number((d_trans_ms * hopCount).toFixed(3)),
    propagationDelayMs: Number((d_prop_ms * hopCount).toFixed(3)),
    processingDelayMs: Number((d_proc_ms * hopCount).toFixed(3)),
    queuingDelayMs: Number((d_queue_ms * hopCount).toFixed(3)),
    totalDelayMs: Number(totalDelayMs.toFixed(2))
  };
}
