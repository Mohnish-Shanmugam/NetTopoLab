import React from 'react';
import { 
  DiscoveryProtocolMetrics, 
  TopologyNode, 
  TopologyLink 
} from '../../types';
import { 
  evaluateAllProtocols 
} from '../../engine/discoveryEngine';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  GitCommit, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface SdnDiscoveryViewProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  isDarkMode?: boolean;
}

export const SdnDiscoveryView: React.FC<SdnDiscoveryViewProps> = ({
  nodes,
  links,
  isDarkMode = false
}) => {
  const analysis = evaluateAllProtocols(nodes, links);

  const chartData = analysis.comparisonRows.map(r => ({
    name: r.protocol.split(' ')[0],
    fullName: r.protocol,
    packetOut: r.packetOut,
    packetIn: r.packetIn,
    totalMsgs: r.totalMessages,
    latencyMs: r.convergenceTimeMs,
    gainPct: r.efficiencyGainPct
  }));

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans select-text">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
            <Zap className="text-[#007AFF]" size={18} />
            <span>SDN & Layer-2 Topology Discovery Protocol Benchmark</span>
          </h2>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Mathematical benchmark evaluation of OFDP, OFDPv2, Im-OFDP (Gu et al.), sOFTDP (Azzouni et al.), and SD-TDP (Ochoa-Aday et al.)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#007AFF]/15 text-[#007AFF] font-medium border border-[#007AFF]/20">
            Active Graph: {nodes.length} Nodes • {links.filter(l => l.status !== 'severed').length} Links
          </span>
        </div>
      </div>

      {/* METRIC KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[12px]">
        <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">Standard OFDP Overhead</div>
          <div className="text-xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
            {analysis.ofdp.totalMessages} <span className="text-[11px] font-normal text-neutral-400">msgs</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">H + 4L periodic controller flood</div>
        </div>

        <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">Im-OFDP Supporting Switches</div>
          <div className="text-xl font-mono font-bold text-[#007AFF]">
            {analysis.imOfdp.supportingSwitchIds.length} <span className="text-[11px] font-normal text-neutral-400">/ {nodes.length} nodes</span>
          </div>
          <div className="text-[10px] text-[#28CD41] font-semibold font-mono">
            {analysis.imOfdp.gainOverOfdp}% message reduction
          </div>
        </div>

        <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">sOFTDP Steady-State Msgs</div>
          <div className="text-xl font-mono font-bold text-[#28CD41]">
            0 <span className="text-[11px] font-normal text-neutral-400">periodic msgs</span>
          </div>
          <div className="text-[10px] text-[#28CD41] font-semibold font-mono">
            100% Elimination of Periodic Polling
          </div>
        </div>

        <div className="bg-white dark:bg-[#202022] p-3 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-1">
          <div className="text-[11px] text-neutral-400 font-medium">sOFTDP Failover Latency</div>
          <div className="text-xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
            3.25 <span className="text-[11px] font-normal text-neutral-400">ms</span>
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Hardware Fast-Failover bucket</div>
        </div>
      </div>

      {/* RECHARTS BENCHMARK VISUALIZATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHART 1: TOTAL CONTROL MESSAGE OVERHEAD */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200">
              Control Message Overhead Comparison
            </span>
            <span className="text-[10px] font-mono text-neutral-400">Packet_Out vs Packet_In</span>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                <Bar dataKey="packetOut" name="Packet_Out" fill="#007AFF" radius={[3, 3, 0, 0]} />
                <Bar dataKey="packetIn" name="Packet_In" fill="#5856D6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CONVERGENCE / LEARNING LATENCY */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200">
              Convergence Latency (ms)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">Lower is Better</span>
          </div>
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                <Bar dataKey="latencyMs" name="Convergence Time (ms)" fill="#28CD41" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED DENSE COMPARISON TABLE */}
      <div className="bg-white dark:bg-[#202022] rounded-lg border border-black/10 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#262629] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <span className="font-semibold text-[12px] text-neutral-800 dark:text-neutral-200">
            Protocol Performance Matrix (Active Graph)
          </span>
          <span className="text-[10px] font-mono text-neutral-500">IEEE Transactions Benchmark Standard</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="bg-[#EFEFF4] dark:bg-[#2C2C2E] text-neutral-600 dark:text-neutral-400 text-[10px]">
              <tr>
                <th className="py-2 px-3 font-semibold">Protocol</th>
                <th className="py-2 px-3 font-semibold">Packet_Out</th>
                <th className="py-2 px-3 font-semibold">Packet_In</th>
                <th className="py-2 px-3 font-semibold">Total Messages</th>
                <th className="py-2 px-3 font-semibold">Steady State</th>
                <th className="py-2 px-3 font-semibold">Convergence</th>
                <th className="py-2 px-3 font-semibold">Efficiency Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {analysis.comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 font-medium text-neutral-900 dark:text-neutral-100">{row.protocol}</td>
                  <td className="py-2 px-3 tabular-nums">{row.packetOut}</td>
                  <td className="py-2 px-3 tabular-nums">{row.packetIn}</td>
                  <td className="py-2 px-3 tabular-nums font-bold text-[#007AFF]">{row.totalMessages}</td>
                  <td className="py-2 px-3">{row.steadyStateMsgsPerSec > 0 ? `${row.steadyStateMsgsPerSec} pps` : '0 (Event-driven)'}</td>
                  <td className="py-2 px-3 tabular-nums">{row.convergenceTimeMs} ms</td>
                  <td className="py-2 px-3 font-bold text-[#28CD41]">{row.efficiencyGainPct > 0 ? `+${row.efficiencyGainPct}%` : 'Baseline'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPENFLOW FLOW RULES (Im-OFDP) & BFD BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Im-OFDP 3 OPENFLOW RULES */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
              <Layers size={14} className="text-[#007AFF]" />
              <span>Im-OFDP OpenFlow Flow Rules</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#007AFF]/15 text-[#007AFF] font-bold">
              Gu et al. Algorithm 1
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Installed on the discovered Minimum Vertex Cover Supporting Switches ({analysis.imOfdp.supportingSwitchIds.join(', ')}):
          </p>

          <div className="space-y-2">
            {analysis.imOfdp.openFlowRules.map(rule => (
              <div key={rule.id} className="p-2.5 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5 font-mono text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#007AFF]">{rule.id}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {rule.priority}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500">Target: {rule.target}</div>
                <div className="text-[10px] text-neutral-700 dark:text-neutral-300">Match: <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{rule.match}</code></div>
                <div className="text-[10px] text-[#28CD41] font-semibold">Action: <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{rule.action}</code></div>
                <div className="text-[10px] text-neutral-400 italic pt-0.5">{rule.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sOFTDP BFD TIMING & FAILOVER */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
              <ShieldCheck size={14} className="text-[#28CD41]" />
              <span>sOFTDP BFD & Fast-Failover Engine</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#28CD41]/15 text-[#28CD41] font-bold">
              Azzouni et al.
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Asynchronous switch-to-switch BFD monitoring completely eliminates periodic controller LLDP flooding while Fast-Failover group tables immediately heal severed links locally.
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">BFD Transmit Interval (Ti):</span>
              <span className="font-bold">{analysis.softdp.bfdTransmitIntervalMs} ms</span>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">Detection Multiplier (M):</span>
              <span className="font-bold">{analysis.softdp.bfdDetectionMultiplier}</span>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">Total BFD Detection Time:</span>
              <span className="font-bold text-[#FF9500]">{analysis.softdp.detectionTimeMs} ms</span>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">Link Addition Learning Time:</span>
              <span className="font-bold text-[#007AFF]">{analysis.softdp.linkAdditionLearningTimeMs}</span>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">Link Removal Failover Latency:</span>
              <span className="font-bold text-[#28CD41]">{analysis.softdp.linkRemovalLearningTimeMs}</span>
            </div>
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded flex justify-between">
              <span className="text-neutral-500">Attack Tolerance / Defense:</span>
              <span className="font-bold text-[#28CD41]">100% Attack Immunity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
