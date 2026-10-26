import { TopologyNode, TopologyLink, PresetKey } from '../types';

export interface TopologyData {
  name: string;
  description: string;
  nodes: TopologyNode[];
  links: TopologyLink[];
}

export function getTopologyPreset(key: PresetKey): TopologyData {
  switch (key) {
    case 'psu':
      return getPsuTopology();
    case 'iiuc':
      return getIiucTopology();
    case 'tree':
      return getTreeTopology();
    case 'linear':
      return getLinearTopology();
    case 'fattree':
      return getFatTreeTopology();
    case 'geant':
      return getGeantTopology();
    default:
      return getPsuTopology();
  }
}

/**
 * Plateau State University (PSU) Campus Network
 * 15 Nodes, 15 Links (Aristarkus et al. & Prince et al.)
 * Proportionally placed to fit 100% within canvas viewport
 */
function getPsuTopology(): TopologyData {
  const nodes: TopologyNode[] = [
    // Core Routers (Top tier)
    { id: 'R1', label: 'R1 (Library Core)', type: 'router', role: 'core', ip: '10.0.0.1', mac: '00:00:00:00:01:01', dpid: '0000000000000001', x: 270, y: 48, status: 'up', subnet: '10.0.0.0/24', trafficThroughputMbps: 950 },
    { id: 'R2', label: 'R2 (ICT Centre Core)', type: 'router', role: 'core', ip: '10.0.0.2', mac: '00:00:00:00:01:02', dpid: '0000000000000002', x: 450, y: 48, status: 'up', subnet: '10.0.0.0/24', trafficThroughputMbps: 980 },
    
    // Faculty Distribution Switches (Mid tier)
    { id: 'S1', label: 'S1 (Natural & Applied Sci)', type: 'switch', role: 'dist', ip: '10.0.1.1', mac: '00:00:00:00:02:01', dpid: '0000000000000011', x: 150, y: 130, status: 'up', subnet: '10.0.1.0/24', vlan: 10, trafficThroughputMbps: 450 },
    { id: 'S2', label: 'S2 (Management Sci)', type: 'switch', role: 'dist', ip: '10.0.2.1', mac: '00:00:00:00:02:02', dpid: '0000000000000012', x: 330, y: 130, status: 'up', subnet: '10.0.2.0/24', vlan: 20, trafficThroughputMbps: 380 },
    { id: 'S3', label: 'S3 (Social Sciences)', type: 'switch', role: 'dist', ip: '10.0.3.1', mac: '00:00:00:00:02:03', dpid: '0000000000000013', x: 240, y: 195, status: 'up', subnet: '10.0.3.0/24', vlan: 30, trafficThroughputMbps: 320 },
    { id: 'S4', label: 'S4 (Faculty of Arts)', type: 'switch', role: 'dist', ip: '10.0.4.1', mac: '00:00:00:00:02:04', dpid: '0000000000000014', x: 550, y: 130, status: 'up', subnet: '10.0.4.0/24', vlan: 40, trafficThroughputMbps: 290 },
    
    // Access Switches (Lower tier)
    { id: 'S5', label: 'S5 (Bio Lab Access)', type: 'switch', role: 'access', ip: '10.0.1.5', mac: '00:00:00:00:03:05', dpid: '0000000000000005', x: 80, y: 195, status: 'up', subnet: '10.0.1.0/24', vlan: 10, trafficThroughputMbps: 180 },
    { id: 'S6', label: 'S6 (Chem Lab Access)', type: 'switch', role: 'access', ip: '10.0.1.6', mac: '00:00:00:00:03:06', dpid: '0000000000000006', x: 80, y: 260, status: 'up', subnet: '10.0.1.0/24', vlan: 10, trafficThroughputMbps: 140 },
    { id: 'S7', label: 'S7 (Accounting Dept)', type: 'switch', role: 'access', ip: '10.0.2.7', mac: '00:00:00:00:03:07', dpid: '0000000000000007', x: 330, y: 195, status: 'up', subnet: '10.0.2.0/24', vlan: 20, trafficThroughputMbps: 160 },
    { id: 'S8', label: 'S8 (Economics Dept)', type: 'switch', role: 'access', ip: '10.0.3.8', mac: '00:00:00:00:03:08', dpid: '0000000000000008', x: 160, y: 260, status: 'up', subnet: '10.0.3.0/24', vlan: 30, trafficThroughputMbps: 130 },
    { id: 'S9', label: 'S9 (Sociology Dept)', type: 'switch', role: 'access', ip: '10.0.3.9', mac: '00:00:00:00:03:09', dpid: '0000000000000009', x: 240, y: 260, status: 'up', subnet: '10.0.3.0/24', vlan: 30, trafficThroughputMbps: 110 },
    { id: 'S10', label: 'S10 (Pol Sci Lab)', type: 'switch', role: 'access', ip: '10.0.3.10', mac: '00:00:00:00:03:10', dpid: '000000000000000a', x: 320, y: 260, status: 'up', subnet: '10.0.3.0/24', vlan: 30, trafficThroughputMbps: 90 },
    { id: 'S11', label: 'S11 (English & Lit)', type: 'switch', role: 'access', ip: '10.0.4.11', mac: '00:00:00:00:03:11', dpid: '000000000000000b', x: 470, y: 195, status: 'up', subnet: '10.0.4.0/24', vlan: 40, trafficThroughputMbps: 120 },
    { id: 'S12', label: 'S12 (History Dept)', type: 'switch', role: 'access', ip: '10.0.4.12', mac: '00:00:00:00:03:12', dpid: '000000000000000c', x: 550, y: 260, status: 'up', subnet: '10.0.4.0/24', vlan: 40, trafficThroughputMbps: 115 },
    { id: 'S13', label: 'S13 (Theology Dept)', type: 'switch', role: 'access', ip: '10.0.4.13', mac: '00:00:00:00:03:13', dpid: '000000000000000d', x: 630, y: 260, status: 'up', subnet: '10.0.4.0/24', vlan: 40, trafficThroughputMbps: 85 }
  ];

  // Exact physical link weights in meters from Aristarkus et al.
  const rawLinks = [
    { src: 'R1', dst: 'S1', dist: 70 },
    { src: 'R1', dst: 'S3', dist: 85 },
    { src: 'R2', dst: 'S2', dist: 96 },
    { src: 'R2', dst: 'S4', dist: 75 },
    { src: 'S1', dst: 'S5', dist: 50 },
    { src: 'S1', dst: 'S2', dist: 60 },
    { src: 'S5', dst: 'S6', dist: 50 },
    { src: 'S2', dst: 'S7', dist: 50 },
    { src: 'S3', dst: 'S8', dist: 50 },
    { src: 'S3', dst: 'S4', dist: 60 },
    { src: 'S8', dst: 'S9', dist: 50 },
    { src: 'S9', dst: 'S10', dist: 50 },
    { src: 'S4', dst: 'S11', dist: 50 },
    { src: 'S11', dst: 'S12', dist: 50 },
    { src: 'S12', dst: 'S13', dist: 50 }
  ];

  const links: TopologyLink[] = rawLinks.map((l, idx) => ({
    id: `link-${l.src}-${l.dst}`,
    source: l.src,
    target: l.dst,
    distanceMeters: l.dist,
    delayMs: Number(((l.dist * 0.005) + 0.35).toFixed(2)),
    capacityMbps: 1000,
    currentFlowMbps: Math.floor(120 + idx * 25),
    cost: l.dist,
    status: 'up'
  }));

  return {
    name: 'Plateau State University (PSU) Hybrid Campus',
    description: '15 Nodes, 15 Physical Links with Exact Distances (Aristarkus et al. & Prince et al.)',
    nodes,
    links
  };
}

/**
 * IIUC Multi-Department Campus Area Network
 * 14 Cisco Routers, 18 Switches, 8 Subnets (Kumar et al. & IIUC BSc Thesis)
 * Normalized to fit 100% within canvas viewport
 */
function getIiucTopology(): TopologyData {
  const nodes: TopologyNode[] = [
    { id: 'ISP-GW', label: 'ISP Border Gateway', type: 'router', role: 'core', ip: '172.16.0.1', mac: 'C0:01:00:00:00:01', x: 360, y: 45, status: 'up', subnet: '172.16.0.0/30' },
    { id: 'R-ADMIN', label: 'Admin Router', type: 'router', role: 'core', ip: '192.168.1.1', mac: 'C0:01:00:00:00:02', x: 235, y: 110, status: 'up', subnet: '192.168.1.0/24', vlan: 10 },
    { id: 'R-ACADEMIC', label: 'Academic Router', type: 'router', role: 'core', ip: '192.168.2.1', mac: 'C0:01:00:00:00:03', x: 485, y: 110, status: 'up', subnet: '192.168.2.0/24', vlan: 20 },
    { id: 'R-HOSTEL', label: 'Hostel Router', type: 'router', role: 'dist', ip: '192.168.3.1', mac: 'C0:01:00:00:00:04', x: 125, y: 175, status: 'up', subnet: '192.168.3.0/24', vlan: 30 },
    { id: 'R-LIBRARY', label: 'Library Router', type: 'router', role: 'dist', ip: '192.168.4.1', mac: 'C0:01:00:00:00:05', x: 275, y: 175, status: 'up', subnet: '192.168.4.0/24', vlan: 40 },
    { id: 'R-LABS', label: 'Research Labs Router', type: 'router', role: 'dist', ip: '192.168.5.1', mac: 'C0:01:00:00:00:06', x: 445, y: 175, status: 'up', subnet: '192.168.5.0/24', vlan: 50 },
    { id: 'R-STAFF', label: 'Staff Quarters Router', type: 'router', role: 'dist', ip: '192.168.6.1', mac: 'C0:01:00:00:00:07', x: 595, y: 175, status: 'up', subnet: '192.168.6.0/24', vlan: 60 },
    { id: 'SW-CORE-A', label: 'Distribution SW Alpha', type: 'switch', role: 'dist', ip: '192.168.10.1', mac: '00:50:56:00:01:01', x: 200, y: 245, status: 'up' },
    { id: 'SW-CORE-B', label: 'Distribution SW Beta', type: 'switch', role: 'dist', ip: '192.168.10.2', mac: '00:50:56:00:01:02', x: 520, y: 245, status: 'up' },
    { id: 'SW-CSE-LAB', label: 'CSE High-Performance Lab', type: 'switch', role: 'access', ip: '192.168.5.10', mac: '00:50:56:00:02:01', x: 360, y: 245, status: 'up' },
    { id: 'SW-VIP-GUEST', label: 'VIP Guest House SW', type: 'switch', role: 'access', ip: '192.168.7.10', mac: '00:50:56:00:02:02', x: 635, y: 245, status: 'up' }
  ];

  const links: TopologyLink[] = [
    { id: 'l1', source: 'ISP-GW', target: 'R-ADMIN', distanceMeters: 45, delayMs: 0.5, capacityMbps: 10000, currentFlowMbps: 450, cost: 45, status: 'up' },
    { id: 'l2', source: 'ISP-GW', target: 'R-ACADEMIC', distanceMeters: 50, delayMs: 0.6, capacityMbps: 10000, currentFlowMbps: 680, cost: 50, status: 'up' },
    { id: 'l3', source: 'R-ADMIN', target: 'R-HOSTEL', distanceMeters: 120, delayMs: 1.2, capacityMbps: 1000, currentFlowMbps: 210, cost: 120, status: 'up' },
    { id: 'l4', source: 'R-ADMIN', target: 'R-LIBRARY', distanceMeters: 80, delayMs: 0.8, capacityMbps: 1000, currentFlowMbps: 190, cost: 80, status: 'up' },
    { id: 'l5', source: 'R-ACADEMIC', target: 'R-LABS', distanceMeters: 75, delayMs: 0.75, capacityMbps: 1000, currentFlowMbps: 340, cost: 75, status: 'up' },
    { id: 'l6', source: 'R-ACADEMIC', target: 'R-STAFF', distanceMeters: 110, delayMs: 1.1, capacityMbps: 1000, currentFlowMbps: 150, cost: 110, status: 'up' },
    { id: 'l7', source: 'R-HOSTEL', target: 'SW-CORE-A', distanceMeters: 60, delayMs: 0.6, capacityMbps: 1000, currentFlowMbps: 180, cost: 60, status: 'up' },
    { id: 'l8', source: 'R-LIBRARY', target: 'SW-CORE-A', distanceMeters: 55, delayMs: 0.55, capacityMbps: 1000, currentFlowMbps: 160, cost: 55, status: 'up' },
    { id: 'l9', source: 'R-LABS', target: 'SW-CSE-LAB', distanceMeters: 40, delayMs: 0.4, capacityMbps: 1000, currentFlowMbps: 310, cost: 40, status: 'up' },
    { id: 'l10', source: 'R-STAFF', target: 'SW-CORE-B', distanceMeters: 65, delayMs: 0.65, capacityMbps: 1000, currentFlowMbps: 140, cost: 65, status: 'up' },
    { id: 'l11', source: 'SW-CORE-B', target: 'SW-VIP-GUEST', distanceMeters: 85, delayMs: 0.85, capacityMbps: 1000, currentFlowMbps: 75, cost: 85, status: 'up' }
  ];

  return {
    name: 'IIUC Multi-Department Campus Area Network',
    description: 'Cisco 7200 Hierarchy, OSPF Multi-Area, ACL Rule Tables & VLAN segmentation',
    nodes,
    links
  };
}

/**
 * Topo1: Tree (d=4, f=4; N=17 clean hierarchy)
 */
function getTreeTopology(): TopologyData {
  const nodes: TopologyNode[] = [
    { id: 'Root', label: 'Core Root', type: 'switch', role: 'core', ip: '10.1.0.1', mac: '00:00:AA:00:00:01', x: 350, y: 50, status: 'up' }
  ];
  const links: TopologyLink[] = [];

  // Level 1: 4 distribution switches evenly distributed
  for (let i = 1; i <= 4; i++) {
    const id = `Dist-${i}`;
    const distX = 100 + (i - 1) * 165;
    nodes.push({
      id,
      label: `Distribution ${i}`,
      type: 'switch',
      role: 'dist',
      ip: `10.1.1.${i}`,
      mac: `00:00:AA:01:00:0${i}`,
      x: distX,
      y: 165,
      status: 'up'
    });
    links.push({
      id: `l-root-${id}`,
      source: 'Root',
      target: id,
      distanceMeters: 60,
      delayMs: 0.6,
      capacityMbps: 10000,
      currentFlowMbps: 400,
      cost: 60,
      status: 'up'
    });

    // Level 2: 3 access switches per dist
    for (let j = 1; j <= 3; j++) {
      const leafId = `Leaf-${i}-${j}`;
      const leafX = distX - 44 + (j - 1) * 44;
      nodes.push({
        id: leafId,
        label: `Leaf ${i}.${j}`,
        type: 'switch',
        role: 'access',
        ip: `10.1.2.${(i - 1) * 3 + j}`,
        mac: `00:00:AA:02:0${i}:0${j}`,
        x: leafX,
        y: 280,
        status: 'up'
      });
      links.push({
        id: `l-${id}-${leafId}`,
        source: id,
        target: leafId,
        distanceMeters: 40,
        delayMs: 0.4,
        capacityMbps: 1000,
        currentFlowMbps: 120,
        cost: 40,
        status: 'up'
      });
    }
  }

  return {
    name: 'Benchmark Topo1: Tree (d=4, f=4)',
    description: 'Hierarchical balanced SDN tree benchmark (Gu et al.)',
    nodes,
    links
  };
}

/**
 * Topo3: Linear Backbone Topology
 */
function getLinearTopology(): TopologyData {
  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];
  const count = 12;

  for (let i = 1; i <= count; i++) {
    nodes.push({
      id: `SW-${i}`,
      label: `Switch Node ${i}`,
      type: 'switch',
      role: i === 1 || i === count ? 'core' : 'dist',
      ip: `10.2.0.${i}`,
      mac: `00:00:BB:00:00:${i < 10 ? '0' + i : i}`,
      x: 65 + (i - 1) * 58,
      y: 175 + (i % 2 === 0 ? 30 : -30),
      status: 'up'
    });
    if (i > 1) {
      links.push({
        id: `l-lin-${i-1}-${i}`,
        source: `SW-${i-1}`,
        target: `SW-${i}`,
        distanceMeters: 50,
        delayMs: 0.5,
        capacityMbps: 1000,
        currentFlowMbps: 200,
        cost: 50,
        status: 'up'
      });
    }
  }

  return {
    name: 'Benchmark Topo3: Linear Network',
    description: 'Sequential daisy-chain linear topology (Worst-case discovery propagation)',
    nodes,
    links
  };
}

/**
 * Topo4: Fat-Tree (k=4)
 */
function getFatTreeTopology(): TopologyData {
  const nodes: TopologyNode[] = [];
  const links: TopologyLink[] = [];

  // 4 Core switches
  for (let c = 1; c <= 4; c++) {
    nodes.push({
      id: `Core-${c}`,
      label: `Core ${c}`,
      type: 'switch',
      role: 'core',
      ip: `10.3.0.${c}`,
      mac: `00:00:CC:00:00:0${c}`,
      x: 160 + (c - 1) * 125,
      y: 50,
      status: 'up'
    });
  }

  // 4 Pods, each with 2 Agg and 2 Edge switches
  for (let p = 1; p <= 4; p++) {
    const agg1 = `Agg-${p}-1`;
    const agg2 = `Agg-${p}-2`;
    const edge1 = `Edge-${p}-1`;
    const edge2 = `Edge-${p}-2`;

    const podCenterX = 85 + (p - 1) * 175;

    nodes.push(
      { id: agg1, label: `Agg P${p}.1`, type: 'switch', role: 'dist', ip: `10.3.${p}.1`, mac: `00:00:CC:01:0${p}:01`, x: podCenterX - 35, y: 165, status: 'up' },
      { id: agg2, label: `Agg P${p}.2`, type: 'switch', role: 'dist', ip: `10.3.${p}.2`, mac: `00:00:CC:01:0${p}:02`, x: podCenterX + 35, y: 165, status: 'up' },
      { id: edge1, label: `Edge P${p}.1`, type: 'switch', role: 'access', ip: `10.3.${p}.11`, mac: `00:00:CC:02:0${p}:01`, x: podCenterX - 35, y: 280, status: 'up' },
      { id: edge2, label: `Edge P${p}.2`, type: 'switch', role: 'access', ip: `10.3.${p}.12`, mac: `00:00:CC:02:0${p}:02`, x: podCenterX + 35, y: 280, status: 'up' }
    );

    // Intra-pod connections (bipartite between Agg and Edge)
    links.push(
      { id: `l-${agg1}-${edge1}`, source: agg1, target: edge1, distanceMeters: 30, delayMs: 0.3, capacityMbps: 1000, currentFlowMbps: 100, cost: 30, status: 'up' },
      { id: `l-${agg1}-${edge2}`, source: agg1, target: edge2, distanceMeters: 30, delayMs: 0.3, capacityMbps: 1000, currentFlowMbps: 100, cost: 30, status: 'up' },
      { id: `l-${agg2}-${edge1}`, source: agg2, target: edge1, distanceMeters: 30, delayMs: 0.3, capacityMbps: 1000, currentFlowMbps: 100, cost: 30, status: 'up' },
      { id: `l-${agg2}-${edge2}`, source: agg2, target: edge2, distanceMeters: 30, delayMs: 0.3, capacityMbps: 1000, currentFlowMbps: 100, cost: 30, status: 'up' }
    );

    // Core connections
    links.push(
      { id: `l-core1-${agg1}`, source: 'Core-1', target: agg1, distanceMeters: 50, delayMs: 0.5, capacityMbps: 10000, currentFlowMbps: 250, cost: 50, status: 'up' },
      { id: `l-core2-${agg1}`, source: 'Core-2', target: agg1, distanceMeters: 50, delayMs: 0.5, capacityMbps: 10000, currentFlowMbps: 250, cost: 50, status: 'up' },
      { id: `l-core3-${agg2}`, source: 'Core-3', target: agg2, distanceMeters: 50, delayMs: 0.5, capacityMbps: 10000, currentFlowMbps: 250, cost: 50, status: 'up' },
      { id: `l-core4-${agg2}`, source: 'Core-4', target: agg2, distanceMeters: 50, delayMs: 0.5, capacityMbps: 10000, currentFlowMbps: 250, cost: 50, status: 'up' }
    );
  }

  return {
    name: 'Benchmark Topo4: Fat-Tree (k=4)',
    description: 'Standard Clos/Fat-Tree topology with multi-path bisection bandwidth',
    nodes,
    links
  };
}

/**
 * Topo5: GÉANT European Research Network Topology (Sampled 16 primary PoPs)
 */
function getGeantTopology(): TopologyData {
  const nodes: TopologyNode[] = [
    // North & West
    { id: 'SE', label: 'Stockholm (SE)', type: 'router', role: 'access', ip: '62.40.124.11', mac: '00:00:EE:00:00:0B', x: 520, y: 55, status: 'up' },
    { id: 'DK', label: 'Copenhagen (DK)', type: 'router', role: 'dist', ip: '62.40.124.10', mac: '00:00:EE:00:00:0A', x: 440, y: 65, status: 'up' },
    { id: 'NL', label: 'Amsterdam (NL)', type: 'router', role: 'core', ip: '62.40.124.3', mac: '00:00:EE:00:00:03', x: 330, y: 95, status: 'up' },
    { id: 'UK', label: 'London (UK)', type: 'router', role: 'core', ip: '62.40.124.1', mac: '00:00:EE:00:00:01', x: 220, y: 95, status: 'up' },
    
    // Central & East
    { id: 'PL', label: 'Warsaw (PL)', type: 'router', role: 'dist', ip: '62.40.124.12', mac: '00:00:EE:00:00:0C', x: 570, y: 115, status: 'up' },
    { id: 'BE', label: 'Brussels (BE)', type: 'router', role: 'dist', ip: '62.40.124.5', mac: '00:00:EE:00:00:05', x: 290, y: 145, status: 'up' },
    { id: 'DE', label: 'Frankfurt (DE - SDN)', type: 'controller', role: 'controller', ip: '62.40.124.4', mac: '00:00:EE:00:00:04', x: 390, y: 150, status: 'up' },
    { id: 'CZ', label: 'Prague (CZ)', type: 'router', role: 'dist', ip: '62.40.124.13', mac: '00:00:EE:00:00:0D', x: 480, y: 145, status: 'up' },
    
    // Central-South & West
    { id: 'FR', label: 'Paris (FR)', type: 'router', role: 'core', ip: '62.40.124.2', mac: '00:00:EE:00:00:02', x: 210, y: 185, status: 'up' },
    { id: 'CH', label: 'Geneva (CH)', type: 'router', role: 'dist', ip: '62.40.124.6', mac: '00:00:EE:00:00:06', x: 320, y: 220, status: 'up' },
    { id: 'AT', label: 'Vienna (AT)', type: 'router', role: 'dist', ip: '62.40.124.14', mac: '00:00:EE:00:00:0E', x: 510, y: 205, status: 'up' },
    { id: 'HU', label: 'Budapest (HU)', type: 'router', role: 'access', ip: '62.40.124.15', mac: '00:00:EE:00:00:0F', x: 600, y: 205, status: 'up' },
    
    // South-West & South-East
    { id: 'ES', label: 'Madrid (ES)', type: 'router', role: 'dist', ip: '62.40.124.8', mac: '00:00:EE:00:00:08', x: 140, y: 245, status: 'up' },
    { id: 'PT', label: 'Lisbon (PT)', type: 'router', role: 'access', ip: '62.40.124.9', mac: '00:00:EE:00:00:09', x: 75, y: 260, status: 'up' },
    { id: 'IT', label: 'Milan (IT)', type: 'router', role: 'dist', ip: '62.40.124.7', mac: '00:00:EE:00:00:07', x: 410, y: 240, status: 'up' },
    { id: 'GR', label: 'Athens (GR)', type: 'router', role: 'access', ip: '62.40.124.16', mac: '00:00:EE:00:00:10', x: 590, y: 270, status: 'up' }
  ];

  const rawLinks = [
    ['UK', 'NL', 360], ['UK', 'FR', 340], ['FR', 'BE', 260], ['FR', 'ES', 800],
    ['FR', 'CH', 400], ['NL', 'DE', 360], ['NL', 'BE', 170], ['BE', 'DE', 320],
    ['DE', 'DK', 500], ['DE', 'PL', 520], ['DE', 'CZ', 410], ['DE', 'CH', 330],
    ['CH', 'IT', 250], ['IT', 'AT', 430], ['IT', 'GR', 1100], ['ES', 'PT', 500],
    ['DK', 'SE', 520], ['PL', 'CZ', 510], ['CZ', 'AT', 250], ['AT', 'HU', 210],
    ['HU', 'GR', 820]
  ];

  const links: TopologyLink[] = rawLinks.map(([src, dst, dist], i) => ({
    id: `l-geant-${i}`,
    source: src as string,
    target: dst as string,
    distanceMeters: (dist as number) * 1000,
    delayMs: Number(((dist as number) * 0.005 + 1.2).toFixed(2)),
    capacityMbps: 100000,
    currentFlowMbps: 1200 + i * 150,
    cost: dist as number,
    status: 'up'
  }));

  return {
    name: 'Benchmark Topo5: GÉANT Research Topology',
    description: 'European research backbone with Frankfurt as SDN controller (Ochoa-Aday et al.)',
    nodes,
    links
  };
}
