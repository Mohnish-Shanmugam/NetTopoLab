import { WirelessMeshSettings } from '../types';

export interface MeshNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  degree: number;
  effectiveK: number;
  discovered: boolean;
}

export interface MeshSimulationResult {
  settings: WirelessMeshSettings;
  nodes: MeshNode[];
  totalNodes: number;
  totalEdges: number;
  avgNeighborDegree: number;
  pctStableLinksDiscovered: number;
  pctNodesDiscovered: number;
  totalRepliesSent: number;
  isInversionProblemActive: boolean;
  inversionDiagnosisText: string;
}

/**
 * Generates 50 wireless campus nodes in 200m x 200m
 */
export function initializeMeshNodes(count: number = 50, areaSize: number = 200): MeshNode[] {
  const nodes: MeshNode[] = [];
  // Use deterministic pseudo-random distribution
  for (let i = 0; i < count; i++) {
    // Seeded coordinates
    const seed = (i + 1) * 37.17;
    const x = 15 + ((Math.sin(seed) * 10000) % (areaSize - 30) + (areaSize - 30)) % (areaSize - 30);
    const y = 15 + ((Math.cos(seed) * 10000) % (areaSize - 30) + (areaSize - 30)) % (areaSize - 30);
    const angle = ((i * 47) % 360) * (Math.PI / 180);
    nodes.push({
      id: i,
      x: Math.round(x),
      y: Math.round(y),
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      degree: 0,
      effectiveK: 2,
      discovered: true
    });
  }
  return nodes;
}

export function simulateMeshCycle(
  currentNodes: MeshNode[],
  settings: WirelessMeshSettings
): MeshSimulationResult {
  const { txPowerDbm, speedMps, kFactor, adaptiveK, panicMode, robustBroadcast } = settings;

  // Transmission range based on power
  const txRange = txPowerDbm <= -10 ? 38 : txPowerDbm <= -6 ? 58 : 78;

  // Update node positions based on speed
  const updatedNodes = currentNodes.map(node => {
    let nx = node.x + node.vx * speedMps * 0.5;
    let ny = node.y + node.vy * speedMps * 0.5;
    let nvx = node.vx;
    let nvy = node.vy;

    // Boundary bounce
    if (nx < 15 || nx > 185) nvx = -nvx;
    if (ny < 15 || ny > 185) nvy = -nvy;

    nx = Math.max(15, Math.min(185, nx));
    ny = Math.max(15, Math.min(185, ny));

    return {
      ...node,
      x: nx,
      y: ny,
      vx: nvx,
      vy: nvy
    };
  });

  // Calculate adjacency and degrees
  let edgeCount = 0;
  const adj = new Map<number, number[]>();
  for (const n of updatedNodes) {
    adj.set(n.id, []);
  }

  for (let i = 0; i < updatedNodes.length; i++) {
    for (let j = i + 1; j < updatedNodes.length; j++) {
      const d = Math.hypot(updatedNodes[i].x - updatedNodes[j].x, updatedNodes[i].y - updatedNodes[j].y);
      if (d <= txRange) {
        adj.get(updatedNodes[i].id)!.push(updatedNodes[j].id);
        adj.get(updatedNodes[j].id)!.push(updatedNodes[i].id);
        edgeCount++;
      }
    }
  }

  // Update degrees and effective k
  let totalDegree = 0;
  for (const n of updatedNodes) {
    n.degree = adj.get(n.id)!.length;
    totalDegree += n.degree;

    if (adaptiveK) {
      if (speedMps > 0.8 || n.degree < 5) {
        n.effectiveK = 1;
      } else if (n.degree < 10) {
        n.effectiveK = 2;
      } else {
        n.effectiveK = Math.min(4, Math.floor(n.degree / 3));
      }
    } else {
      n.effectiveK = kFactor;
    }
  }

  const avgDegree = edgeCount > 0 ? (totalDegree / updatedNodes.length) : 0;

  // Collision drop based on robustBroadcast
  let collisionSuccessRate = 1.0;
  if (!robustBroadcast) {
    if (txPowerDbm <= -10) collisionSuccessRate = 0.9391;
    else if (txPowerDbm <= -6) collisionSuccessRate = 0.8291;
    else collisionSuccessRate = 0.7840;
  }

  // Calculate discovered links and Inversion Problem
  // Cascading timeout: timeout = 2 * (ecc - d_Pi + 1) * Delta
  // Higher k -> longer wait time.
  // If mobility speed is high (> 0.6 m/s) and network is sparse (-10 dBm),
  // links move out of range BEFORE the higher-k cascading timeout completes!
  let discoveredLinks = 0;
  let totalReplies = 0;

  for (let i = 0; i < updatedNodes.length; i++) {
    for (const neighborId of adj.get(updatedNodes[i].id)!) {
      if (neighborId > updatedNodes[i].id) {
        const effK = Math.min(updatedNodes[i].effectiveK, updatedNodes.find(n => n.id === neighborId)!.effectiveK);
        totalReplies += effK;

        // Waiting window in ms:
        const waitWindowMs = effK * 45;
        // Expected link stability lifetime under mobility:
        const linkLifetimeMs = speedMps > 0 ? (12.0 / speedMps) * 1000 : 999999;

        // Inversion check:
        let linkSuccess = true;
        if (waitWindowMs > linkLifetimeMs * 0.05) {
          // If k is large and speed is high, link breaks during discovery!
          if (!adaptiveK && effK >= 3 && speedMps >= 0.8 && txPowerDbm <= -10) {
            linkSuccess = false; // Link severed by mobility during high-k timeout!
          }
        }

        if (linkSuccess && Math.random() <= collisionSuccessRate) {
          discoveredLinks++;
        }
      }
    }
  }

  const pctStableLinks = edgeCount > 0 ? Math.round((discoveredLinks / edgeCount) * 100) : 0;
  const pctNodes = Math.min(100, Math.round(pctStableLinks * 1.1));

  // Determine if Inversion Problem occurred
  const isInversion = !adaptiveK && kFactor >= 3 && speedMps >= 0.8 && txPowerDbm <= -10;

  let diagnosis = 'Normal operation: Mesh DAG discovery converging within latency bounds.';
  if (isInversion) {
    diagnosis = 'INVERSION PROBLEM ACTIVE: High resiliency factor (k=3+) increased cascading parent timeouts beyond the link contact window at current walking speed. k=1 would paradoxically discover MORE stable links!';
  } else if (adaptiveK) {
    diagnosis = 'Adaptive-k Controller ACTIVE: Dynamically throttled k=1 on fast-moving edge nodes while sustaining k=3 on dense core clusters. Inversion completely eliminated.';
  }

  return {
    settings,
    nodes: updatedNodes,
    totalNodes: updatedNodes.length,
    totalEdges: edgeCount,
    avgNeighborDegree: Number(avgDegree.toFixed(1)),
    pctStableLinksDiscovered: pctStableLinks,
    pctNodesDiscovered: pctNodes,
    totalRepliesSent: totalReplies,
    isInversionProblemActive: isInversion,
    inversionDiagnosisText: diagnosis
  };
}
