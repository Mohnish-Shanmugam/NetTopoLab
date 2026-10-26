import { AttackScenario, PacketTrace } from '../types';

export interface SecurityMatrixRow {
  attackType: string;
  threatDescription: string;
  ofdpVulnerability: string;
  ofdpAcceptancePct: number;
  imOfdpDefense: string;
  imOfdpAcceptancePct: number;
  softdpDefense: string;
  softdpAcceptancePct: number;
}

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'atk-switch-spoof',
    name: 'Attack 1: Switch Identity Spoofing',
    target: 'Distribution Switch S1 / S4',
    attackerNode: 'S4',
    victimNodes: ['S1', 'R1'],
    active: false,
    description: 'Adversary switch sniffs unauthenticated ChassisSubtype and DPID from LLDP frames, then reconnects to SDN controller impersonating legitimate Core/Distribution switch.',
    packetOutSignature: 'ETHERNET [dst=01:80:C2:00:00:0E] LLDP [Chassis ID=S1-DPID, Port=eth1] Spoofed from S4',
    mitigation: 'sOFTDP Cryptographic Token Handshake + Im-OFDP Port MAC verification'
  },
  {
    id: 'atk-link-fabrication-forge',
    name: 'Attack 2: Link Fabrication (Direct LLDP Forgery)',
    target: 'Inter-Switch Link S1 <-> S3',
    attackerNode: 'S6',
    victimNodes: ['S1', 'S3'],
    active: false,
    description: 'Compromised edge host injects raw crafted LLDP frames with victim DPID (S3) into access switch S1, fooling controller into creating a non-existent direct link S3 -> S1.',
    packetOutSignature: 'FORGED_LLDP [dl_src=Host_h1, Target_DPID=S3] -> OFPT_PACKET_IN',
    mitigation: 'sOFTDP drop_lldp rule on edge host ports + Im-OFDP Rule II bounce check'
  },
  {
    id: 'atk-link-fabrication-relay',
    name: 'Attack 3: Out-of-Band LLDP Relay / Tunnel Attack',
    target: 'Non-Adjacent Core Nodes R1 <-> R2',
    attackerNode: 'S5',
    victimNodes: ['R1', 'R2'],
    active: false,
    description: 'Two colluding compromised hosts sniff genuine LLDP packets and tunnel them across an out-of-band tunnel. Note: Even static/dynamic HMAC fails here, but Im-OFDP port rewrite and sOFTDP 500ms PORT_UP window completely defeat it!',
    packetOutSignature: 'TUNNELED_GENUINE_LLDP [Encapsulated in GRE/UDP] from Host1 -> Host2',
    mitigation: 'Im-OFDP enforces mod_dl_src=MAC(in_port); sOFTDP only permits LLDP within 500ms of PORT_UP'
  },
  {
    id: 'atk-dos-flooding',
    name: 'Attack 4: Controller Fingerprinting & LLDP Flooding DoS',
    target: 'SDN Controller (c0)',
    attackerNode: 'S8',
    victimNodes: ['R1', 'R2', 'S1', 'S2'],
    active: false,
    description: 'Attacker fingerprints controller software (POX vs Floodlight via LLDP timer intervals) and floods 50,000 bogus LLDP Packet_In frames/sec to exhaust controller CPU memory.',
    packetOutSignature: 'BURST_FLOOD: 50,000 pkt/s OFPT_PACKET_IN [Random Chassis IDs] to Controller Port 6653',
    mitigation: 'sOFTDP BFD offloads liveliness to OVS datapath; controller rejects unsolicited Packet_In'
  }
];

export const DEFENSE_MATRIX: SecurityMatrixRow[] = [
  {
    attackType: 'Switch Spoofing (Sniff DPID)',
    threatDescription: 'Adversary switch reconnects impersonating legitimate switch',
    ofdpVulnerability: 'Vulnerable (Cleartext DPID & Port ID in LLDP)',
    ofdpAcceptancePct: 100,
    imOfdpDefense: 'Protected (Checked against Supporting Switch map)',
    imOfdpAcceptancePct: 0,
    softdpDefense: 'Protected (Token-authenticated BFD session)',
    softdpAcceptancePct: 0
  },
  {
    attackType: 'Direct Link Fabrication',
    threatDescription: 'Host crafts forged LLDP frame into switch port',
    ofdpVulnerability: 'Vulnerable (Switch reflexively sends Packet_In)',
    ofdpAcceptancePct: 100,
    imOfdpDefense: 'Protected (Rule II requires reverse bounce validation)',
    imOfdpAcceptancePct: 0,
    softdpDefense: 'Protected (drop_lldp flow installed on all host ports)',
    softdpAcceptancePct: 0
  },
  {
    attackType: 'Out-of-Band Relay / Tunnel',
    threatDescription: 'Two colluding hosts tunnel genuine LLDP frames',
    ofdpVulnerability: 'Fatal (Even HMAC signatures cannot detect relay)',
    ofdpAcceptancePct: 100,
    imOfdpDefense: 'Defeated (Bounced packet contains wrong port MAC)',
    imOfdpAcceptancePct: 0,
    softdpDefense: 'Defeated (PORT_UP trigger required; 500ms timeout)',
    softdpAcceptancePct: 0
  },
  {
    attackType: 'Controller LLDP Flooding DoS',
    threatDescription: 'High-frequency packet flood exhausts controller CPU',
    ofdpVulnerability: 'Fatal (Controller bottlenecks at 100% CPU)',
    ofdpAcceptancePct: 100,
    imOfdpDefense: 'Moderate (Reduced volume from vertex cover)',
    imOfdpAcceptancePct: 20,
    softdpDefense: 'Zero Impact (Switches handle BFD in fast hardware datapath)',
    softdpAcceptancePct: 0
  }
];

export function generateAttackPackets(scenarioId: string, currentStep: number): PacketTrace[] {
  const traces: PacketTrace[] = [];
  const baseTime = currentStep * 10;

  if (scenarioId === 'atk-switch-spoof') {
    traces.push({
      no: baseTime + 1,
      timeMs: Number((baseTime + 0.15).toFixed(2)),
      source: 'Adversary (S4)',
      destination: 'Controller (c0)',
      protocol: 'ATTACK-SPOOF',
      length: 128,
      info: 'MALICIOUS: OFPT_HELLO & FEATURES_REPLY spoofing Chassis ID of S1',
      isMalicious: true,
      tlvPayload: {
        'Spoofed DPID': '0000000000000011 (S1)',
        'Physical Ingress': 'eth4 (S4)',
        'Status in OFDP': 'ACCEPTED (POISONED)',
        'Status in sOFTDP': 'BLOCKED & DROPPED'
      }
    });
  } else if (scenarioId === 'atk-link-fabrication-forge') {
    traces.push({
      no: baseTime + 1,
      timeMs: Number((baseTime + 0.35).toFixed(2)),
      source: 'Compromised Host (h5)',
      destination: 'Access Switch (S5)',
      protocol: 'ATTACK-SPOOF',
      length: 98,
      info: 'MALICIOUS: Injected forged LLDP with victim DPID S3 into host port',
      isMalicious: true,
      tlvPayload: {
        'Target Forged Link': 'S3 -> S5 (Fake Unidirectional)',
        'Status in OFDP': 'POISONED ROUTING GRAPH',
        'Status in Im-OFDP': 'BLOCKED (Bounce MAC Mismatch)'
      }
    });
  } else if (scenarioId === 'atk-link-fabrication-relay') {
    traces.push({
      no: baseTime + 1,
      timeMs: Number((baseTime + 0.50).toFixed(2)),
      source: 'Malicious Relay (S5 -> GRE)',
      destination: 'Malicious Receiver (S11)',
      protocol: 'ATTACK-RELAY',
      length: 164,
      info: 'MALICIOUS: Out-of-band tunnel relay of authentic LLDP frame',
      isMalicious: true,
      tlvPayload: {
        'Tunnel Protocol': 'GRE / UDP Port 4789',
        'HMAC Check': 'BYPASSED (Packet was unmodified)',
        'sOFTDP Defense': 'BLOCKED: Port S11 was already UP (no 500ms window)'
      }
    });
  } else if (scenarioId === 'atk-dos-flooding') {
    for (let i = 0; i < 4; i++) {
      traces.push({
        no: baseTime + i + 1,
        timeMs: Number((baseTime + i * 0.2).toFixed(2)),
        source: 'Flooding Botnet (S8)',
        destination: 'SDN Controller (c0)',
        protocol: 'ATTACK-SPOOF',
        length: 64,
        info: `MALICIOUS: LLDP Packet_In Flood [Burst Seq ${i + 1}/50000] - CPU Spike`,
        isMalicious: true,
        tlvPayload: {
          'Controller CPU': '99.8% (OFDP) vs 2.1% (sOFTDP)',
          'Flood Target': 'OpenFlow TCP:6653'
        }
      });
    }
  }

  return traces;
}
