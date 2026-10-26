import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Moon, 
  Sun, 
  PanelLeft, 
  FileCode2,
  Activity,
  Network
} from 'lucide-react';
import { MainViewTab } from '../types';

interface MacTitlebarProps {
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: 1 | 5;
  onToggleSpeed: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  documentTitle?: string;
}

export const MacTitlebar: React.FC<MacTitlebarProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  speed,
  onToggleSpeed,
  isDarkMode,
  onToggleDarkMode,
  isSidebarOpen,
  onToggleSidebar,
  documentTitle = 'PSU-Hybrid-Campus.topo — Edited'
}) => {
  return (
    <header className="h-11 flex-shrink-0 flex items-center justify-between px-3.5 bg-[#E8E8ED]/95 dark:bg-[#202022]/95 backdrop-blur-md border-b border-black/10 dark:border-white/10 select-none z-30 transition-colors">
      {/* Left: Window Controls + Document Title */}
      <div className="flex items-center space-x-3.5 min-w-[240px]">
        {/* macOS Traffic Lights */}
        <div className="flex items-center space-x-2 group">
          <button 
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center text-[8px] text-black/60 opacity-90 hover:opacity-100 transition-opacity" 
            title="Close Window"
          />
          <button 
            className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center text-[8px] text-black/60 opacity-90 hover:opacity-100 transition-opacity" 
            title="Minimize"
          />
          <button 
            className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center text-[8px] text-black/60 opacity-90 hover:opacity-100 transition-opacity" 
            title="Zoom / Fullscreen"
          />
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className={`p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300 ${
            !isSidebarOpen ? 'opacity-60' : ''
          }`}
          title="Toggle Sidebar (⌘B)"
        >
          <PanelLeft size={15} />
        </button>

        {/* Document Title with Proxy Icon */}
        <div className="flex items-center space-x-1.5 text-[12px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
          <Network size={13} className="text-[#007AFF] flex-shrink-0" />
          <span className="truncate">{documentTitle}</span>
        </div>
      </div>

      {/* Center: macOS Native Segmented Control */}
      <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg border border-black/5 dark:border-white/10 text-[12px]">
        <button
          id="tab-topology-studio"
          onClick={() => onTabChange('topology_studio')}
          className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
            activeTab === 'topology_studio'
              ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Topology Studio
        </button>

        <button
          id="tab-sdn-discovery"
          onClick={() => onTabChange('sdn_discovery')}
          className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
            activeTab === 'sdn_discovery'
              ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          SDN Discovery
        </button>

        <button
          id="tab-security-lab"
          onClick={() => onTabChange('security_lab')}
          className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
            activeTab === 'security_lab'
              ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Security Lab
        </button>

        <button
          id="tab-routing-mesh"
          onClick={() => onTabChange('routing_mesh')}
          className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
            activeTab === 'routing_mesh'
              ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Routing & Mesh
        </button>

        <button
          id="tab-export-center"
          onClick={() => onTabChange('export_center')}
          className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
            activeTab === 'export_center'
              ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          LaTeX / CSV Export
        </button>
      </div>

      {/* Right: Simulation Controls & Appearance */}
      <div className="flex items-center space-x-2 min-w-[240px] justify-end">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[12px] font-medium border transition-colors ${
            isRunning
              ? 'bg-[#007AFF] text-white border-[#0062CC]'
              : 'bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A]'
          }`}
          title="Run / Pause Simulation (Space)"
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
          <span>{isRunning ? 'Pause' : 'Run'}</span>
        </button>

        {/* Step +1ms */}
        <button
          onClick={onStep}
          disabled={isRunning}
          className="px-2 py-1 rounded text-[11px] font-medium bg-white dark:bg-[#2C2C2E] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A] disabled:opacity-40 transition-colors"
          title="Step forward +1ms"
        >
          Step +1ms
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1.5 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Reset Simulation State"
        >
          <RotateCcw size={13} />
        </button>

        {/* Speed: 1x / 5x */}
        <button
          onClick={onToggleSpeed}
          className="px-2 py-1 rounded text-[11px] font-mono font-medium bg-white dark:bg-[#2C2C2E] text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A] transition-colors"
          title="Simulation Rate"
        >
          {speed}x
        </button>

        {/* Appearance Mode */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Toggle Light / Dark Appearance"
        >
          {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
};
