import { TopologyNode, TopologyLink, DiscoveryProtocolMetrics, PacketTrace } from '../types';

export interface ImOfdpAnalysis {
  supportingSwitchIds: string[];
  openFlowRules: {
    id: string;
    priority: 'High (32768)' | 'Middle (16384)' | 'Low (8192)';
    target: string;
    match: string;
    action: string;
    description: string;
  }[];
  metrics: DiscoveryProtocolMetrics;
  gainOverOfdp: number; // percentage
  gainOverOfdpv2: number; // percentage
}

export interface SoftdpAnalysis {
  bfdTransmitIntervalMs: number;
  bfdDetectionMultiplier: number;
  detectionTimeMs: number;
  steadyStatePollingMsgs: number;
  linkAdditionLearningTimeMs: string;
  linkRemovalLearningTimeMs: string;
  fastFailoverEnabled: boolean;
  securityScore: number; // 100%
  metrics: DiscoveryProtocolMetrics;
}

export interface SdTdpAnalysis {
  fatherNodeIds: string[];
  childrenNodeIds: string[];
  rootControllerNode: string;
  totalAgentPackets: number;
  convergenceTimeMs: number;
  metrics: DiscoveryProtocolMetrics;
}

/**
 * Computes Im-OFDP Minimum Vertex Cover (Algorithm 1 from Gu et al.)
 */
export function computeImOfdpVertexCover(nodes: TopologyNode[], links: TopologyLink[]): string[] {
  const activeLinks = links.filter(l => l.status !== 'severed');
  const edgeList: [string, string][] = activeLinks.map(l => [l.source, l.target]);
  const remainingEdges = new Set(edgeList.map(e => `${e[0]}|${e[1]}`));
  const supportingSwitches: string[] = [];

  while (remainingEdges.size > 0) {
    // Calculate degrees in remaining edges
    const degreeMap = new Map<string, number>();
    for (const key of remainingEdges) {
      const [u, v] = key.split('|');
      degreeMap.set(u, (degreeMap.get(u) || 0) + 1);
      degreeMap.set(v, (degreeMap.get(v) || 0) + 1);
    }

    let maxDeg = -1;
    for (const d of degreeMap.values()) {
      if (d > maxDeg) maxDeg = d;
    }

    const candidates: string[] = [];
    for (const [nodeId, deg] of degreeMap.entries()) {
      if (deg === maxDeg) candidates.push(nodeId);
    }

    // Tie-break: candidate with maximum neighbors in candidates
    let bestNode = candidates[0];
    let bestCandidateNeighbors = -1;

    for (const cand of candidates) {
      let candNeighCount = 0;
      for (const key of remainingEdges) {
        const [u, v] = key.split('|');
        if (u === cand && candidates.includes(v)) candNeighCount++;
        if (v === cand && candidates.includes(u)) candNeighCount++;
      }
      if (candNeighCount > bestCandidateNeighbors) {
        bestCandidateNeighbors = candNeighCount;
        bestNode = cand;
      }
    }

    supportingSwitches.push(bestNode);

    // Remove incident edges
    for (const key of Array.from(remainingEdges)) {
      const [u, v] = key.split('|');
      if (u === bestNode || v === bestNode) {
        remainingEdges.delete(key);
      }
    }
  }

  return supportingSwitches;
}

/**
 * Evaluates all 5 SDN Discovery Protocols dynamically
 */
export function evaluateAllProtocols(nodes: TopologyNode[], links: TopologyLink[]): {
  ofdp: DiscoveryProtocolMetrics;
  ofdpv2: DiscoveryProtocolMetrics;
  imOfdp: ImOfdpAnalysis;
  softdp: SoftdpAnalysis;
  sdTdp: SdTdpAnalysis;
  comparisonRows: DiscoveryProtocolMetrics[];
} {
  const N = nodes.length;
  const activeLinks = links.filter(l => l.status !== 'severed');
  const L = activeLinks.length;
  const H = N * 2; // Avg 2 hosts per switch

  // 1. Standard OFDP: Packet_Out = H + 2L, Packet_In = 2L, Total = H + 4L
  const ofdpTotal = H + 4 * L;
  const ofdpMetrics: DiscoveryProtocolMetrics = {
    protocol: 'Standard OFDP',
    packetOut: H + 2 * L,
    packetIn: 2 * L,
    totalMessages: ofdpTotal,
    steadyStateMsgsPerSec: Math.round(ofdpTotal / 5),
    cpuLoad: 'High (100% Core Load)',
    convergenceTimeMs: 48.5,
    efficiencyGainPct: 0
  };

  // 2. OFDPv2: Packet_Out = N, Packet_In = 2L, Total = N + 2L
  const ofdpv2Total = N + 2 * L;
  const ofdpv2Gain = Math.round(((ofdpTotal - ofdpv2Total) / ofdpTotal) * 100);
  const ofdpv2Metrics: DiscoveryProtocolMetrics = {
    protocol: 'OFDPv2 (Header Rewrite)',
    packetOut: N,
    packetIn: 2 * L,
    totalMessages: ofdpv2Total,
    steadyStateMsgsPerSec: Math.round(ofdpv2Total / 5),
    cpuLoad: 'Moderate (55% Load)',
    convergenceTimeMs: 38.2,
    efficiencyGainPct: ofdpv2Gain
  };

  // 3. Im-OFDP (Gu et al.)
  const supportingIds = computeImOfdpVertexCover(nodes, links);
  const Nx = supportingIds.length;
  const imOfdpTotal = Nx + L;
  const g1 = Math.round(((ofdpTotal - imOfdpTotal) / ofdpTotal) * 100);
  const g2 = Math.round(((ofdpv2Total - imOfdpTotal) / ofdpv2Total) * 100);

  const imOfdpMetrics: DiscoveryProtocolMetrics = {
    protocol: 'Im-OFDP (Supporting Switches)',
    packetOut: Nx,
    packetIn: L,
    totalMessages: imOfdpTotal,
    steadyStateMsgsPerSec: Math.round(imOfdpTotal / 5),
    cpuLoad: 'Low (22% Load)',
    convergenceTimeMs: 14.8,
    efficiencyGainPct: g1
  };

  const imOfdpRules: ImOfdpAnalysis['openFlowRules'] = [
    {
      id: 'RULE-1',
      priority: 'High (32768)',
      target: `Supporting Switches (${Nx} nodes: ${supportingIds.join(', ')})`,
      match: 'in_port=CONTROLLER, dl_type=0x88CC, dl_src=00:00:00:00:00:00',
      action: 'OUTPUT=assigned_active_ports',
      description: 'Injects probing LLDP frames into discovered neighbor links from supporting switches.'
    },
    {
      id: 'RULE-2',
      priority: 'Middle (16384)',
      target: 'All Switches (N nodes)',
      match: 'dl_type=0x88CC, dl_src=00:00:00:00:00:00',
      action: 'mod_dl_src=MAC(in_port), OUTPUT=in_port',
      description: 'Rewrites frame source MAC with incoming port MAC and bounces LLDP directly back across link.'
    },
    {
      id: 'RULE-3',
      priority: 'Low (8192)',
      target: 'All Switches (N nodes)',
      match: 'dl_type=0x88CC',
      action: 'OUTPUT=CONTROLLER (Packet_In)',
      description: 'Forwards reversed LLDP with verified MAC to SDN controller to confirm link existence.'
    }
  ];

  const imOfdpAnalysis: ImOfdpAnalysis = {
    supportingSwitchIds: supportingIds,
    openFlowRules: imOfdpRules,
    metrics: imOfdpMetrics,
    gainOverOfdp: g1,
    gainOverOfdpv2: g2
  };

  // 4. sOFTDP (Azzouni et al.)
  const softdpMetrics: DiscoveryProtocolMetrics = {
    protocol: 'sOFTDP (Secure BFD + Fast-Failover)',
    packetOut: 0,
    packetIn: 0,
    totalMessages: 0, // In steady state, 0 periodic polling messages
    steadyStateMsgsPerSec: 0,
    cpuLoad: 'Near-Zero (Switches handle BFD locally)',
    convergenceTimeMs: 5.68,
    efficiencyGainPct: 100
  };

  const softdpAnalysis: SoftdpAnalysis = {
    bfdTransmitIntervalMs: 16.7,
    bfdDetectionMultiplier: 3,
    detectionTimeMs: 50.1,
    steadyStatePollingMsgs: 0,
    linkAdditionLearningTimeMs: '5.68 ± 0.85 ms',
    linkRemovalLearningTimeMs: '3.25 ± 0.008 ms',
    fastFailoverEnabled: true,
    securityScore: 100,
    metrics: softdpMetrics
  };

  // 5. SD-TDP (Ochoa-Aday et al.)
  // Father nodes are high-degree non-leaf switches
  const rootNode = nodes.find(n => n.role === 'core') || nodes[0];
  const fatherNodes = nodes.filter(n => n.role === 'core' || n.role === 'dist').map(n => n.id);
  const childrenNodes = nodes.filter(n => !fatherNodes.includes(n.id)).map(n => n.id);
  const totalAgentPackets = fatherNodes.length * 2 + childrenNodes.length;

  const sdTdpMetrics: DiscoveryProtocolMetrics = {
    protocol: 'SD-TDP (Agent Spanning Tree)',
    packetOut: fatherNodes.length,
    packetIn: childrenNodes.length,
    totalMessages: totalAgentPackets,
    steadyStateMsgsPerSec: Math.round(totalAgentPackets / 10),
    cpuLoad: 'Very Low (Distributed Father Aggregation)',
    convergenceTimeMs: 29.9,
    efficiencyGainPct: Math.round(((ofdpTotal - totalAgentPackets) / ofdpTotal) * 100)
  };

  const sdTdpAnalysis: SdTdpAnalysis = {
    fatherNodeIds: fatherNodes,
    childrenNodeIds: childrenNodes,
    rootControllerNode: rootNode ? rootNode.id : 'R1',
    totalAgentPackets,
    convergenceTimeMs: 29.9,
    metrics: sdTdpMetrics
  };

  return {
    ofdp: ofdpMetrics,
    ofdpv2: ofdpv2Metrics,
    imOfdp: imOfdpAnalysis,
    softdp: softdpAnalysis,
    sdTdp: sdTdpAnalysis,
    comparisonRows: [ofdpMetrics, ofdpv2Metrics, imOfdpMetrics, softdpMetrics, sdTdpMetrics]
  };
}

/**
 * Generates initial realistic packet traces for Wireshark / Inspector drawer
 */
export function generateInitialPacketTraces(): PacketTrace[] {
  return [
    {
      no: 1,
      timeMs: 0.12,
      source: 'Controller (c0)',
      destination: 'R1 (00:00:00:00:01:01)',
      protocol: 'OFDP',
      length: 128,
      info: 'OFPT_PACKET_OUT [in_port=OFPP_CONTROLLER, actions=OUTPUT:ALL] LLDP Probing frame',
      tlvPayload: {
        'Chassis ID': '00:00:00:00:00:01',
        'Port ID': 'Port 1 (eth0)',
        'TTL': '120s',
        'System Name': 'SDN-Floodlight-Core'
      }
    },
    {
      no: 2,
      timeMs: 1.45,
      source: 'S1 (00:00:00:00:02:01)',
      destination: 'Controller (c0)',
      protocol: 'OFDP',
      length: 142,
      info: 'OFPT_PACKET_IN [in_port=2, buffer_id=256] Validated neighbor R1 port 1 link',
      tlvPayload: {
        'Chassis ID': '00:00:00:00:02:01',
        'Neighbor Chassis': '00:00:00:00:01:01',
        'Link Delay': '0.70 ms'
      }
    },
    {
      no: 3,
      timeMs: 3.20,
      source: 'Controller (c0)',
      destination: 'S1 (Supporting Switch)',
      protocol: 'Im-OFDP',
      length: 98,
      info: 'OFPT_FLOW_MOD [Priority 32768, dl_type=0x88CC, dl_src=0] -> OUTPUT=assigned_ports',
      tlvPayload: {
        'Supporting Node': 'S1',
        'Assigned Ports': 'eth1, eth2, eth5'
      }
    },
    {
      no: 4,
      timeMs: 4.88,
      source: 'S5 (00:00:00:00:03:05)',
      destination: 'S1 (00:00:00:00:02:01)',
      protocol: 'Im-OFDP',
      length: 94,
      info: 'LLDP Bounce Response [mod_dl_src=MAC(in_port), OUTPUT=in_port]',
      tlvPayload: {
        'Rule': 'RULE-II (Middle Priority)',
        'Bounced Port': 'eth1',
        'Source MAC Rewritten': '00:00:00:00:03:05'
      }
    },
    {
      no: 5,
      timeMs: 16.70,
      source: 'R1 (10.0.0.1)',
      destination: 'S1 (10.0.1.1)',
      protocol: 'sOFTDP-BFD',
      length: 64,
      info: 'BFD Control Frame [State=Up, Diag=0, MyDisc=104, YourDisc=208, Tx=16.7ms, M=3]',
      tlvPayload: {
        'BFD Version': '1',
        'Detect Mult': '3',
        'State': '3 (Up)',
        'Echo Rx': '0 ms'
      }
    },
    {
      no: 6,
      timeMs: 33.40,
      source: 'S1 (10.0.1.1)',
      destination: 'R1 (10.0.0.1)',
      protocol: 'sOFTDP-BFD',
      length: 64,
      info: 'BFD Control Frame [State=Up, Diag=0, MyDisc=208, YourDisc=104, Echo OK]',
      tlvPayload: {
        'State': '3 (Up)',
        'Measured RTT': '0.70 ms'
      }
    },
    {
      no: 7,
      timeMs: 45.10,
      source: 'R2 (10.0.0.2)',
      destination: '224.0.0.5',
      protocol: 'OSPFv2',
      length: 88,
      info: 'OSPF Hello Packet [Area 0.0.0.0, Priority 1, Hello 10s, Dead 40s]',
      tlvPayload: {
        'Router ID': '10.0.0.2',
        'Area ID': '0.0.0.0',
        'Auth Type': '2 (Cryptographic MD5)',
        'MD5 Key ID': '1'
      }
    },
    {
      no: 8,
      timeMs: 50.12,
      source: 'Father-Agent (R1)',
      destination: 'Child-Node (S5)',
      protocol: 'SD-TDP',
      length: 110,
      info: 'TDP-Request [State: Standby -> Father, Requesting Neighbor Table]',
      tlvPayload: {
        'Optimal Path Delay': '1.20 ms',
        'Father ID': 'R1'
      }
    }
  ];
}
