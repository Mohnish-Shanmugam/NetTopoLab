import React from 'react';
import { 
  TopologyNode, 
  TopologyLink 
} from '../types';
import { 
  UpgraderStepResult, 
  PsuScorecard 
} from '../engine/hybridUpgrader';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Sliders, 
  Activity, 
  Layers, 
  Flame, 
  Radio 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

interface InspectorPanelProps {
  selectedNode: TopologyNode | null;
  selectedLink: TopologyLink | null;
  onToggleNodeStatus: (nodeId: string) => void;
  onToggleLinkStatus: (linkId: string) => void;
  onRunUpgrader: () => void;
  upgraderSteps: UpgraderStepResult[];
  psuScorecard: PsuScorecard[];
  isUpgraded: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNode,
  selectedLink,
  onToggleNodeStatus,
  onToggleLinkStatus,
  onRunUpgrader,
  upgraderSteps,
  psuScorecard,
  isUpgraded
}) => {
  // Mini telemetry data
  const telemetryData = [
    { time: '0s', traffic: 320, latency: 4.2 },
    { time: '1s', traffic: 410, latency: 4.8 },
    { time: '2s', traffic: 380, latency: 3.9 },
    { time: '3s', traffic: 520, latency: 5.1 },
    { time: '4s', traffic: 480, latency: 4.0 },
    { time: '5s', traffic: 610, latency: 3.8 }
  ];

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col bg-[#F5F5F7]/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl border-l border-black/10 dark:border-white/10 select-none overflow-y-auto z-20 text-[12px]">
      <div className="p-3.5 space-y-4">
        {/* TOP TITLE: ATTRIBUTES INSPECTOR */}
        <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center space-x-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
            <Sliders size={13} className="text-[#007AFF]" />
            <span>Attributes Inspector</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-neutral-500">
            Xcode macOS Pro
          </span>
        </div>

        {/* 1. CONTEXTUAL NODE / LINK INSPECTION */}
        {selectedNode ? (
          <div className="bg-white dark:bg-[#252528] rounded-lg p-3 border border-black/10 dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedNode.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedNode.status === 'down' ? 'bg-[#FF3B30] text-white' : 'bg-[#28CD41] text-white'
              }`}>
                {selectedNode.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Node ID:</span>
                <span className="font-bold">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Device Role:</span>
                <span className="capitalize">{selectedNode.role} ({selectedNode.type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">IP Address:</span>
                <span>{selectedNode.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">DPID / MAC:</span>
                <span className="text-[10px]">{selectedNode.dpid || selectedNode.mac}</span>
              </div>
              {selectedNode.vlan && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">VLAN Tag:</span>
                  <span>VLAN {selectedNode.vlan}</span>
                </div>
              )}
              {selectedNode.trafficThroughputMbps && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Throughput:</span>
                  <span className="text-[#007AFF] font-bold">{selectedNode.trafficThroughputMbps} Mbps</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onToggleNodeStatus(selectedNode.id)}
              className={`w-full py-1.5 rounded font-sans text-[11px] font-medium border transition-colors ${
                selectedNode.status === 'down'
                  ? 'bg-[#28CD41] text-white border-[#24B83B]'
                  : 'bg-[#FF3B30] text-white border-[#E0352A]'
              }`}
            >
              {selectedNode.status === 'down' ? 'Power On Node' : 'Simulate Node Crash (Fault)'}
            </button>
          </div>
        ) : selectedLink ? (
          <div className="bg-white dark:bg-[#252528] rounded-lg p-3 border border-black/10 dark:border-white/10 shadow-xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                Link: {selectedLink.source} ↔ {selectedLink.target}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                selectedLink.status === 'severed' ? 'bg-[#FF3B30] text-white' : 'bg-[#28CD41] text-white'
              }`}>
                {selectedLink.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-400">Physical Length:</span>
                <span className="font-bold text-[#007AFF]">{selectedLink.distanceMeters} meters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Propagation Delay:</span>
                <span>{selectedLink.delayMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Bandwidth:</span>
                <span>{selectedLink.capacityMbps} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Current Load:</span>
                <span>{selectedLink.currentFlowMbps} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Link Cost CL(k):</span>
                <span>{selectedLink.cost}</span>
              </div>
              {selectedLink.isSyntheticBypass && (
                <div className="flex justify-between text-[#007AFF] font-bold">
                  <span>Type:</span>
                  <span>Prince et al. Synthesized Bypass</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onToggleLinkStatus(selectedLink.id)}
              className={`w-full py-1.5 rounded font-sans text-[11px] font-medium border transition-colors ${
                selectedLink.status === 'severed'
                  ? 'bg-[#28CD41] text-white border-[#24B83B]'
                  : 'bg-[#FF3B30] text-white border-[#E0352A]'
              }`}
            >
              {selectedLink.status === 'severed' ? 'Restore Physical Fiber' : 'Sever Link (Fiber Cut)'}
            </button>
          </div>
        ) : (
          <div className="p-3 text-center text-neutral-400 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5 text-[11px] italic">
            Select any node or physical link on the canvas to inspect its parameters.
          </div>
        )}

        {/* 2. AUTOMATED 4-STEP TOPOLOGY UPGRADER (PRINCE ET AL.) */}
        <div className="bg-white dark:bg-[#252528] rounded-lg p-3 border border-black/10 dark:border-white/10 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-[12px] flex items-center space-x-1">
              <ShieldCheck size={14} className="text-[#007AFF]" />
              <span>4-Step Hybrid Synthesizer</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#007AFF]/15 text-[#007AFF]">
              Prince et al. 2023
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Synthesizes 100% single-link and single-node failure survivability using Euclidean DFS graph partitioning.
          </p>

          <button
            id="btn-run-upgrader"
            onClick={onRunUpgrader}
            className={`w-full py-1.5 px-3 rounded font-medium text-[12px] flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
              isUpgraded
                ? 'bg-[#28CD41] text-white border-[#24B83B]'
                : 'bg-[#007AFF] text-white border-[#0062CC] hover:bg-[#0069D9]'
            }`}
          >
            {isUpgraded ? <CheckCircle2 size={13} /> : <Play size={13} />}
            <span>{isUpgraded ? 'Topology Upgraded (Active)' : 'Run 4-Step Upgrader'}</span>
          </button>

          {/* Upgrade Steps Progress */}
          {upgraderSteps.length > 0 && (
            <div className="space-y-1.5 pt-1 font-mono text-[10px]">
              {upgraderSteps.map(step => (
                <div key={step.stepNumber} className="p-1.5 bg-black/5 dark:bg-white/5 rounded flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
                    <span className="truncate">{step.stepName}</span>
                  </div>
                  <span className="text-neutral-500 flex-shrink-0">
                    {step.linksAdded.length > 0 ? `+${step.linksAdded.length} links` : 'Base'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. PSU STATISTICAL SCORECARD */}
        <div className="bg-white dark:bg-[#252528] rounded-lg p-3 border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">PSU Empirical Scorecard</span>
            <span className="text-[10px] text-neutral-400">Aristarkus et al.</span>
          </div>

          <div className="space-y-1.5">
            {psuScorecard.map((row, idx) => (
              <div key={idx} className="flex flex-col text-[10px] pb-1 border-b border-black/5 dark:border-white/5 last:border-none">
                <div className="flex justify-between font-medium text-neutral-700 dark:text-neutral-300">
                  <span>{row.metric}</span>
                  <span className="text-[#28CD41] font-bold">{row.improvement}</span>
                </div>
                <div className="flex justify-between font-mono text-neutral-400 text-[9px]">
                  <span>Legacy Star: {row.legacyStar}</span>
                  <span className="text-[#007AFF]">Hybrid: {row.hybridUpgraded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LIVE MINI TELEMETRY CHART */}
        <div className="bg-white dark:bg-[#252528] rounded-lg p-3 border border-black/10 dark:border-white/10 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center space-x-1">
              <Activity size={12} className="text-[#007AFF]" />
              <span>Real-time Telemetry</span>
            </span>
            <span className="text-[10px] font-mono text-[#007AFF]">Avg 4.1 ms</span>
          </div>

          <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Area type="monotone" dataKey="traffic" stroke="#007AFF" strokeWidth={1.5} fillOpacity={1} fill="url(#telemetryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </aside>
  );
};
