import React from 'react';
import { 
  Network, 
  Layers, 
  ShieldAlert, 
  Radio, 
  FileText, 
  Server, 
  GitBranch, 
  Compass, 
  AlertTriangle,
  Zap,
  Cpu
} from 'lucide-react';
import { PresetKey, MainViewTab } from '../types';

interface MacSidebarProps {
  currentPreset: PresetKey;
  onSelectPreset: (preset: PresetKey) => void;
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
  selectedProtocol: string;
  onSelectProtocol: (protocol: string) => void;
  activeAttackId: string | null;
  onTriggerAttack: (attackId: string) => void;
}

export const MacSidebar: React.FC<MacSidebarProps> = ({
  currentPreset,
  onSelectPreset,
  activeTab,
  onTabChange,
  selectedProtocol,
  onSelectProtocol,
  activeAttackId,
  onTriggerAttack
}) => {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-[#F5F5F7]/95 dark:bg-[#1E1E1E]/95 backdrop-blur-xl border-r border-black/10 dark:border-white/10 select-none overflow-y-auto z-20 text-[13px]">
      <div className="p-3 space-y-5">
        {/* SECTION: CAMPUS PRESETS */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Campus Presets
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectPreset('psu');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'psu' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Network size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">PSU Hybrid Campus</span>
                <span className="block text-[10px] opacity-75">15 Nodes, 15 Links</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset('iiuc');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'iiuc' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Server size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">IIUC Multi-Dept CAN</span>
                <span className="block text-[10px] opacity-75">14 Cisco Routers, ACL</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset('tree');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'tree' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <GitBranch size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">Topo1: Tree (d=4, f=4)</span>
                <span className="block text-[10px] opacity-75">Gu et al. Scale Topo</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset('linear');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'linear' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Layers size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">Topo3: Linear Backbone</span>
                <span className="block text-[10px] opacity-75">Worst-case Discovery</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset('fattree');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'fattree' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Cpu size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">Topo4: Fat-Tree (k=4)</span>
                <span className="block text-[10px] opacity-75">Bisection Clos Fabric</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectPreset('geant');
                onTabChange('topology_studio');
              }}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                currentPreset === 'geant' && activeTab === 'topology_studio'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Compass size={14} className="flex-shrink-0" />
              <div className="truncate">
                <span className="block truncate">Topo5: GÉANT Backbone</span>
                <span className="block text-[10px] opacity-75">40 Nodes, Ochoa-Aday</span>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION: DISCOVERY PROTOCOLS */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Discovery Protocols
          </div>
          <div className="space-y-0.5">
            {[
              { id: 'im-ofdp', label: 'Im-OFDP (Vertex Cover)', badge: '74% Gain' },
              { id: 'softdp', label: 'sOFTDP (Secure BFD)', badge: '0 Poll' },
              { id: 'ofdp', label: 'Standard OFDP', badge: 'H+4L' },
              { id: 'ofdpv2', label: 'OFDPv2 (Header Rewrite)', badge: 'N+2L' },
              { id: 'sd-tdp', label: 'SD-TDP (Spanning Tree)', badge: 'Ochoa' }
            ].map(proto => (
              <button
                key={proto.id}
                onClick={() => {
                  onSelectProtocol(proto.id);
                  onTabChange('sdn_discovery');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  activeTab === 'sdn_discovery' && selectedProtocol === proto.id
                    ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="truncate">{proto.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTab === 'sdn_discovery' && selectedProtocol === proto.id
                    ? 'bg-white/20 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {proto.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: FAULT & SECURITY INJECTION */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Security Attack Lab
          </div>
          <div className="space-y-0.5">
            {[
              { id: 'atk-switch-spoof', label: 'Switch Spoofing' },
              { id: 'atk-link-fabrication-forge', label: 'LLDP Link Forgery' },
              { id: 'atk-link-fabrication-relay', label: 'Out-of-Band Relay' },
              { id: 'atk-dos-flooding', label: 'LLDP Flooding DoS' }
            ].map(atk => (
              <button
                key={atk.id}
                onClick={() => {
                  onTriggerAttack(atk.id);
                  onTabChange('security_lab');
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  activeTab === 'security_lab' && activeAttackId === atk.id
                    ? 'bg-[#FF3B30] text-white font-medium shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ShieldAlert size={13} className="flex-shrink-0" />
                <span className="truncate">{atk.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: ROUTING & MESH */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Routing & Mesh
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onTabChange('routing_mesh')}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                activeTab === 'routing_mesh'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Radio size={13} className="flex-shrink-0" />
              <span className="truncate">RIP vs OSPF vs EIGRP & Mesh</span>
            </button>
          </div>
        </div>

        {/* SECTION: ACADEMIC EXPORTS */}
        <div>
          <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
            Reports & Code
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => onTabChange('export_center')}
              className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                activeTab === 'export_center'
                  ? 'bg-[#007AFF] text-white font-medium shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FileText size={13} className="flex-shrink-0" />
              <span className="truncate">IEEE LaTeX & Cisco CLI</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
