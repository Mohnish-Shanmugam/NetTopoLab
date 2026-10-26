import React, { useState } from 'react';
import { 
  TopologyNode, 
  TopologyLink 
} from '../../types';
import { 
  exportTopologyCsv, 
  exportSdnBenchmarkCsv, 
  exportSecurityMatrixCsv, 
  generateIeeeLatexTable, 
  generateCiscoIosConfig, 
  generateOpenFlowRulesConfig 
} from '../../engine/exportEngine';
import { 
  evaluateAllProtocols 
} from '../../engine/discoveryEngine';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Layers, 
  Cpu 
} from 'lucide-react';

interface ExportCenterViewProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  isDarkMode?: boolean;
}

export const ExportCenterView: React.FC<ExportCenterViewProps> = ({
  nodes,
  links,
  isDarkMode = false
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'latex' | 'cisco' | 'openflow' | 'python'>('latex');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const analysis = evaluateAllProtocols(nodes, links);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latexCode = generateIeeeLatexTable();
  const ciscoCode = generateCiscoIosConfig();
  const openFlowCode = generateOpenFlowRulesConfig();
  const pythonScriptInfo = `#!/usr/bin/env python3
# Executed via command line:
# python sdn_emulation/sdn_discovery_benchmark.py --topology psu --protocol all
# python sdn_emulation/wireless_mesh_sim.py --power -10 --speed 1.5 --k 3 --adaptive-k
# sudo python sdn_emulation/mininet_campus_topo.py

# Scripts are available locally in the project repository under /sdn_emulation/`;

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans select-text">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
            <FileText className="text-[#007AFF]" size={18} />
            <span>Academic Report, IEEE LaTeX & CLI Export Center</span>
          </h2>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Export IEEE Transactions conference tables, raw CSV experiment datasets, and native Cisco IOS / Open vSwitch configurations.
          </p>
        </div>
      </div>

      {/* 1. ONE-CLICK CSV DOWNLOAD SECTION */}
      <div className="space-y-3">
        <div className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-200">
          Raw Analytical Data Exports (CSV)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-[12px]">Topology Nodes & Links</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Physical distances, latencies, capacities, and coordinates.</div>
            </div>
            <button
              onClick={() => handleDownloadCsv(exportTopologyCsv(nodes, links), 'nettopolab_topology_data.csv')}
              className="mt-2 py-1.5 px-3 rounded bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A] text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download size={12} />
              <span>Download Topology CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-[12px]">SDN Discovery Benchmarks</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Message counts, steady-state rates, and efficiency gains.</div>
            </div>
            <button
              onClick={() => handleDownloadCsv(exportSdnBenchmarkCsv(analysis.comparisonRows), 'nettopolab_sdn_benchmarks.csv')}
              className="mt-2 py-1.5 px-3 rounded bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A] text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download size={12} />
              <span>Download Benchmark CSV</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-[12px]">Security Threat Matrix</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Vulnerability scores and defense mechanisms against attacks.</div>
            </div>
            <button
              onClick={() => handleDownloadCsv(exportSecurityMatrixCsv(), 'nettopolab_security_matrix.csv')}
              className="mt-2 py-1.5 px-3 rounded bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A] text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download size={12} />
              <span>Download Security CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SYNTAX-HIGHLIGHTED SCRIPT & CODE EXPORT VIEWER */}
      <div className="bg-white dark:bg-[#202022] rounded-lg border border-black/10 dark:border-white/10 shadow-xs overflow-hidden flex flex-col">
        {/* Sub-header with Segmented Controls */}
        <div className="px-4 py-2 bg-[#F5F5F7] dark:bg-[#262629] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/10 p-0.5 rounded border border-black/5 dark:border-white/10">
            <button
              onClick={() => setActiveCodeTab('latex')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeCodeTab === 'latex'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              IEEE LaTeX Table
            </button>
            <button
              onClick={() => setActiveCodeTab('cisco')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeCodeTab === 'cisco'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Cisco IOS Script
            </button>
            <button
              onClick={() => setActiveCodeTab('openflow')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeCodeTab === 'openflow'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              OpenFlow 1.3 Rules
            </button>
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeCodeTab === 'python'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Python / Mininet CLI
            </button>
          </div>

          <button
            onClick={() => {
              const textToCopy = 
                activeCodeTab === 'latex' ? latexCode :
                activeCodeTab === 'cisco' ? ciscoCode :
                activeCodeTab === 'openflow' ? openFlowCode : pythonScriptInfo;
              handleCopy(textToCopy, activeCodeTab);
            }}
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 flex items-center space-x-1"
          >
            {copiedKey === activeCodeTab ? <Check size={12} className="text-[#28CD41]" /> : <Copy size={12} />}
            <span>{copiedKey === activeCodeTab ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
          </button>
        </div>

        {/* Code Content Box */}
        <div className="p-4 bg-[#141416] text-neutral-300 font-mono text-[11px] overflow-x-auto max-h-[420px] select-text">
          <pre className="whitespace-pre">
            {activeCodeTab === 'latex' && latexCode}
            {activeCodeTab === 'cisco' && ciscoCode}
            {activeCodeTab === 'openflow' && openFlowCode}
            {activeCodeTab === 'python' && pythonScriptInfo}
          </pre>
        </div>
      </div>
    </div>
  );
};
