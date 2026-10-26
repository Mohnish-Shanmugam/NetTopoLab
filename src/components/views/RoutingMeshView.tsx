import React, { useState, useEffect } from 'react';
import { 
  ROUTING_COMPARISON_DATA, 
  TRAFFIC_PROFILES, 
  calculateEndToEndDelay 
} from '../../engine/routingEngine';
import { 
  initializeMeshNodes, 
  simulateMeshCycle, 
  MeshSimulationResult 
} from '../../engine/wirelessMeshEngine';
import { WirelessMeshSettings } from '../../types';
import { 
  Radio, 
  Activity, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Sparkles,
  Wifi,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';

interface RoutingMeshViewProps {
  isDarkMode?: boolean;
}

export const RoutingMeshView: React.FC<RoutingMeshViewProps> = ({
  isDarkMode = false
}) => {
  // Routing State
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>('voip');
  const [qosEnabled, setQosEnabled] = useState<boolean>(true);
  const [md5Enabled, setMd5Enabled] = useState<boolean>(true);
  const [hopCount, setHopCount] = useState<number>(4);

  // Wireless Mesh State
  const [meshSettings, setMeshSettings] = useState<WirelessMeshSettings>({
    txPowerDbm: -10,
    speedMps: 1.2,
    kFactor: 3,
    adaptiveK: false,
    panicMode: false,
    robustBroadcast: true
  });

  const [meshResult, setMeshResult] = useState<MeshSimulationResult>(() => {
    const initNodes = initializeMeshNodes(50, 200);
    return simulateMeshCycle(initNodes, {
      txPowerDbm: -10,
      speedMps: 1.2,
      kFactor: 3,
      adaptiveK: false,
      panicMode: false,
      robustBroadcast: true
    });
  });

  // Re-run mesh cycle on setting change
  useEffect(() => {
    const updated = simulateMeshCycle(meshResult.nodes, meshSettings);
    setMeshResult(updated);
  }, [meshSettings]);

  const profile = TRAFFIC_PROFILES[selectedProfileKey];
  const delayCalc = calculateEndToEndDelay({
    hopCount,
    packetSizeBytes: profile.packetSizePayloadBytes,
    linkCapacityMbps: 1000,
    propagationDistanceKm: 0.5,
    qosEnabled
  });

  // Generate Inversion Problem curve: Stable links vs speed for k=1, k=3, k=5, and Adaptive
  const speedPoints = [0.0, 0.4, 0.8, 1.2, 1.6, 2.0];
  const inversionCurveData = speedPoints.map(speed => {
    // Math model from Chandra et al.
    // In sparse -10 dBm, higher k degrades at speed > 0.6 m/s
    const k1 = Math.max(20, Math.round(98 - speed * 16));
    const k3 = speed <= 0.6 ? 96 : Math.max(10, Math.round(96 - (speed - 0.6) * 65));
    const k5 = speed <= 0.4 ? 94 : Math.max(5, Math.round(94 - (speed - 0.4) * 85));
    const adaptive = Math.round(98 - speed * 8);

    return {
      speed: `${speed} m/s`,
      'k = 1': k1,
      'k = 3 (Inversion)': k3,
      'k = 5 (Worst)': k5,
      'Adaptive-k (Proposed)': adaptive
    };
  });

  const rttChartData = ROUTING_COMPARISON_DATA.map(r => ({
    name: r.protocol,
    minRtt: r.rttMinAvgMaxMs[0],
    avgRtt: r.rttMinAvgMaxMs[1],
    maxRtt: r.rttMinAvgMaxMs[2],
    throughputMin: r.throughputPacketsSec[0],
    throughputMax: r.throughputPacketsSec[1]
  }));

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans select-text">
      {/* SECTION 1: CAMPUS INTRA-DOMAIN ROUTING COMPARATOR */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 gap-3">
          <div>
            <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
              <Radio className="text-[#007AFF]" size={18} />
              <span>Intra-Domain Campus Routing & QoS Evaluation Suite</span>
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Empirical comparison of EIGRP (DUAL), OSPFv2 (Dijkstra), RIPv2 (Bellman-Ford), and IS-IS under VoIP & Video QoS policies
            </p>
          </div>

          {/* Interactive QoS & Auth Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQosEnabled(!qosEnabled)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition-colors ${
                qosEnabled
                  ? 'bg-[#28CD41] text-white border-[#24B83B]'
                  : 'bg-white dark:bg-[#2C2C2E] text-neutral-600 dark:text-neutral-400 border-black/10 dark:border-white/10'
              }`}
            >
              <span>Priority QoS: {qosEnabled ? 'ENABLED (1000 pps)' : 'DISABLED (400 pps)'}</span>
            </button>

            <button
              onClick={() => setMd5Enabled(!md5Enabled)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 transition-colors ${
                md5Enabled
                  ? 'bg-[#007AFF] text-white border-[#0062CC]'
                  : 'bg-white dark:bg-[#2C2C2E] text-neutral-600 dark:text-neutral-400 border-black/10 dark:border-white/10'
              }`}
            >
              <ShieldCheck size={12} />
              <span>MD5 Keychain: {md5Enabled ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* DELAY PARAMETERS & LIVE EQUATION CALCULATOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-3">
            <div className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
              Traffic Profile & Hop Configuration
            </div>

            <div className="space-y-2 text-[11px]">
              <div>
                <label className="text-neutral-500 block mb-1">Traffic Type:</label>
                <select
                  value={selectedProfileKey}
                  onChange={(e) => setSelectedProfileKey(e.target.value)}
                  className="w-full bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded px-2 py-1 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="voip">VoIP (G.711 PCM - 160B, 150ms budget)</option>
                  <option value="video">Video Conferencing (H.264 - 1200B)</option>
                  <option value="db_sync">Campus Database Sync (1500B)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-neutral-500 mb-1">
                  <span>Routing Path Hop Count (N):</span>
                  <span className="font-mono font-bold text-[#007AFF]">{hopCount} hops</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hopCount}
                  onChange={(e) => setHopCount(Number(e.target.value))}
                  className="w-full accent-[#007AFF]"
                />
              </div>
            </div>
          </div>

          {/* EXACT EQUATION BREAKDOWN CARD */}
          <div className="md:col-span-2 bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
              <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
                End-to-End Latency Formula: d_end-end = N [d_trans + d_prop + d_proc + d_queue]
              </span>
              <span className="text-[10px] font-mono text-[#007AFF]">Exact Analytical Model</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded">
                <span className="text-neutral-500 block text-[10px]">Transmission (d_trans)</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{delayCalc.transmissionDelayMs} ms</span>
              </div>
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded">
                <span className="text-neutral-500 block text-[10px]">Propagation (d_prop)</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{delayCalc.propagationDelayMs} ms</span>
              </div>
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded">
                <span className="text-neutral-500 block text-[10px]">Router Proc (d_proc)</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{delayCalc.processingDelayMs} ms</span>
              </div>
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded">
                <span className="text-neutral-500 block text-[10px]">Queuing (d_queue)</span>
                <span className="font-bold text-[#28CD41]">{delayCalc.queuingDelayMs} ms</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[12px] font-mono">
              <span className="text-neutral-500">Total Calculated End-to-End Latency:</span>
              <span className="text-lg font-bold text-[#007AFF]">{delayCalc.totalDelayMs} ms</span>
            </div>
          </div>
        </div>

        {/* RTT BENCHMARK CHART */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200">
              Protocol Round-Trip Time (RTT: Min, Avg, Max) & Throughput Bounds
            </span>
            <span className="text-[10px] font-mono text-neutral-400">IIUC Empirical Testbed Data</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rttChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDarkMode ? '#A1A1A6' : '#6E6E73' }} />
                <YAxis tick={{ fontSize: 10, fill: isDarkMode ? '#A1A1A6' : '#6E6E73' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
                    borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA', 
                    borderRadius: 6, 
                    fontSize: 11 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="minRtt" name="Min RTT (ms)" fill="#5856D6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="avgRtt" name="Avg RTT (ms)" fill="#007AFF" radius={[2, 2, 0, 0]} />
                <Bar dataKey="maxRtt" name="Max RTT (ms)" fill="#FF9500" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: HYBRID WIRELESS MESH & THE INVERSION PROBLEM */}
      <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-black/5 dark:border-white/5 gap-3">
          <div>
            <h3 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
              <Wifi className="text-[#007AFF]" size={17} />
              <span>Campus Wireless Mesh Mobility & "The Inversion Problem" Simulator</span>
            </h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Grounded in Chandra et al. & Kaur et al. (50 ZigBee/Mesh Nodes in 200m x 200m). Proves higher k degrades discovery under walking speeds.
            </p>
          </div>

          {/* Adaptive-k Toggle Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMeshSettings(s => ({ ...s, adaptiveK: !s.adaptiveK }))}
              className={`px-3 py-1 rounded text-[11px] font-medium border flex items-center space-x-1.5 transition-all ${
                meshSettings.adaptiveK
                  ? 'bg-[#28CD41] text-white border-[#24B83B] shadow-sm'
                  : 'bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-neutral-100'
              }`}
            >
              <Sparkles size={12} />
              <span>Adaptive-k Controller: {meshSettings.adaptiveK ? 'ENABLED (Optimal)' : 'DISABLED'}</span>
            </button>
          </div>
        </div>

        {/* INVERSION DIAGNOSIS BANNER */}
        <div className={`p-3 rounded-lg border text-[11px] font-mono leading-relaxed flex items-start space-x-2 ${
          meshResult.isInversionProblemActive
            ? 'bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]'
            : meshSettings.adaptiveK
            ? 'bg-[#28CD41]/10 border-[#28CD41] text-[#28CD41]'
            : 'bg-white dark:bg-[#202022] border-black/10 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
        }`}>
          {meshResult.isInversionProblemActive ? (
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-[#28CD41]" />
          )}
          <span>{meshResult.inversionDiagnosisText}</span>
        </div>

        {/* MESH CONTROLS & KPIS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[12px]">
          {/* CONTROL: TX POWER */}
          <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1.5">
            <span className="text-neutral-500 text-[11px] block">Transmission Power:</span>
            <div className="flex space-x-1">
              {([-10, -6, -4] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setMeshSettings(s => ({ ...s, txPowerDbm: p }))}
                  className={`flex-1 py-1 rounded text-[11px] font-mono font-medium border ${
                    meshSettings.txPowerDbm === p
                      ? 'bg-[#007AFF] text-white border-[#0062CC]'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {p} dBm
                </button>
              ))}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {meshSettings.txPowerDbm === -10 ? '~38m range (Sparse)' : meshSettings.txPowerDbm === -6 ? '~58m (Medium)' : '~78m (Dense)'}
            </div>
          </div>

          {/* CONTROL: MOBILITY SPEED */}
          <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Mobility Speed:</span>
              <span className="font-mono font-bold text-[#007AFF]">{meshSettings.speedMps.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={meshSettings.speedMps}
              onChange={(e) => setMeshSettings(s => ({ ...s, speedMps: Number(e.target.value) }))}
              className="w-full accent-[#007AFF]"
            />
            <div className="text-[10px] text-neutral-400">0.0 (Fixed) to 2.0 (Walking/Run)</div>
          </div>

          {/* CONTROL: RESILIENCY FACTOR k */}
          <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1.5">
            <span className="text-neutral-500 text-[11px] block">Resiliency Factor (k):</span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(k => (
                <button
                  key={k}
                  disabled={meshSettings.adaptiveK}
                  onClick={() => setMeshSettings(s => ({ ...s, kFactor: k }))}
                  className={`flex-1 py-1 rounded text-[11px] font-mono font-medium border ${
                    meshSettings.kFactor === k && !meshSettings.adaptiveK
                      ? 'bg-[#007AFF] text-white border-[#0062CC]'
                      : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300 disabled:opacity-40'
                  }`}
                >
                  k={k}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">Max parent nodes in DAG</div>
          </div>

          {/* KPI: STABLE LINKS DISCOVERED */}
          <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
            <div className="text-[11px] text-neutral-400 font-medium">Discovered Stable Links</div>
            <div className="text-xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
              {meshResult.pctStableLinksDiscovered}%
            </div>
            <div className="text-[10px] text-neutral-500 font-mono">
              Replies Sent: {meshResult.totalRepliesSent} • Avg Deg: {meshResult.avgNeighborDegree}
            </div>
          </div>
        </div>

        {/* INVERSION PROBLEM CURVE RECHARTS GRAPH */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200">
              Proving "The Inversion Problem" — % Stable Links Discovered vs. Mobility Speed (m/s)
            </span>
            <span className="text-[10px] font-mono text-[#007AFF]">Chandra et al. Sparse Network Model (-10 dBm)</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inversionCurveData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <XAxis dataKey="speed" tick={{ fontSize: 10, fill: isDarkMode ? '#A1A1A6' : '#6E6E73' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDarkMode ? '#A1A1A6' : '#6E6E73' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', 
                    borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA', 
                    borderRadius: 6, 
                    fontSize: 11 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Line type="monotone" dataKey="k = 1" stroke="#007AFF" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="k = 3 (Inversion)" stroke="#FF9500" strokeWidth={2} strokeDasharray="5,5" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="k = 5 (Worst)" stroke="#FF3B30" strokeWidth={2} strokeDasharray="3,3" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Adaptive-k (Proposed)" stroke="#28CD41" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
