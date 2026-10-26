import React, { useState, useRef, useEffect } from 'react';
import { 
  TopologyNode, 
  TopologyLink, 
  ActivePacketAnimation 
} from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ShieldCheck, 
  Layers, 
  Server, 
  Wifi, 
  Crosshair,
  AlertOctagon
} from 'lucide-react';

interface TopologyCanvasProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  onSelectNode: (node: TopologyNode) => void;
  onSelectLink: (link: TopologyLink) => void;
  onToggleLinkStatus: (linkId: string) => void;
  onToggleNodeStatus: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  selectedNodeId?: string;
  selectedLinkId?: string;
  supportingSwitchIds?: string[];
  fatherNodeIds?: string[];
  packetAnimations?: ActivePacketAnimation[];
  isDarkMode?: boolean;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes,
  links,
  onSelectNode,
  onSelectLink,
  onToggleLinkStatus,
  onToggleNodeStatus,
  onUpdateNodePosition,
  selectedNodeId,
  selectedLinkId,
  supportingSwitchIds = [],
  fatherNodeIds = [],
  packetAnimations = [],
  isDarkMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 40 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Auto-fit topology bounds to viewport
  const fitToScreen = () => {
    if (!containerRef.current || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      // Account for node circle (17px radius) and label banner (48px half-width)
      const left = n.x - 52;
      const right = n.x + 52;
      const top = n.y - 25;
      const bottom = n.y + 46; // label is at y+27 with 16px height

      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
    }

    // Safety margins: account for top HUD overlay (72px) and bottom controls (45px)
    const paddingX = 42;
    const paddingTop = 72;
    const paddingBottom = 48;

    const availableW = Math.max(80, rect.width - paddingX * 2);
    const availableH = Math.max(80, rect.height - paddingTop - paddingBottom);
    const topoW = Math.max(80, maxX - minX);
    const topoH = Math.max(80, maxY - minY);

    const scaleX = availableW / topoW;
    const scaleY = availableH / topoH;
    const newScale = Math.min(1.15, Math.max(0.30, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const panX = rect.width / 2 - centerX * newScale;
    const panY = paddingTop + availableH / 2 - centerY * newScale;

    setScale(Number(newScale.toFixed(2)));
    setPan({ x: Math.round(panX), y: Math.round(panY) });
  };

  // Auto-fit on nodes change or window resize
  useEffect(() => {
    const t = setTimeout(() => {
      fitToScreen();
    }, 40);
    return () => clearTimeout(t);
  }, [nodes]);

  useEffect(() => {
    const handleResize = () => fitToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [nodes]);

  // Pan canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    // If not clicking on a node or link, start pan
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (e.clientX - rect.left - pan.x) / scale;
      const newY = (e.clientY - rect.top - pan.y) / scale;
      onUpdateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale(s => {
      const nextScale = Math.min(2.5, Math.max(0.25, Number((s * zoomFactor).toFixed(2))));
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        setPan(prev => ({
          x: Math.round(mouseX - (mouseX - prev.x) * (nextScale / s)),
          y: Math.round(mouseY - (mouseY - prev.y) * (nextScale / s))
        }));
      }
      return nextScale;
    });
  };

  const zoomIn = () => setScale(s => Math.min(2.2, Number((s + 0.12).toFixed(2))));
  const zoomOut = () => setScale(s => Math.max(0.3, Number((s - 0.12).toFixed(2))));

  // Node position lookup
  const nodeMap = new Map<string, TopologyNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  const activeLinksCount = links.filter(l => l.status !== 'severed').length;
  const severedLinksCount = links.length - activeLinksCount;

  return (
    <div 
      ref={containerRef}
      id="canvas-bg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        isDarkMode ? 'bg-[#141414] canvas-grid-dark' : 'bg-[#FFFFFF] canvas-grid-light'
      }`}
    >
      {/* Top Floating macOS HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2">
        <div className="backdrop-blur-md bg-white/85 dark:bg-[#1E1E1E]/85 border border-black/10 dark:border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono shadow-sm flex items-center space-x-3 text-neutral-800 dark:text-neutral-200">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#28CD41] animate-pulse" />
            <span className="font-semibold">ENGINE: 60 FPS</span>
          </div>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span>NODES: <span className="tabular-nums font-semibold">{nodes.length}</span></span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span>
            LINKS: <span className="tabular-nums font-semibold text-[#28CD41]">{activeLinksCount}</span>
            {severedLinksCount > 0 && (
              <span className="text-[#FF3B30] font-semibold ml-1">({severedLinksCount} SEVERED)</span>
            )}
          </span>
          <span className="text-black/20 dark:text-white/20">|</span>
          <span>ZOOM: <span className="tabular-nums">{Math.round(scale * 100)}%</span></span>
        </div>

        <div className="backdrop-blur-md bg-white/85 dark:bg-[#1E1E1E]/85 border border-black/10 dark:border-white/10 rounded-md px-2.5 py-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 shadow-sm hidden md:block">
          💡 Drag canvas/wheel to pan & zoom • Click link to sever • Double-click node to focus
        </div>
      </div>

      {/* Floating Canvas Navigation Toolbar */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-1 backdrop-blur-md bg-white/85 dark:bg-[#1E1E1E]/85 border border-black/10 dark:border-white/10 rounded-md p-1 shadow-sm">
        <button
          onClick={zoomIn}
          className="p-1 rounded text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Zoom In (+)"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={zoomOut}
          className="p-1 rounded text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Zoom Out (-)"
        >
          <ZoomOut size={14} />
        </button>
        <button
          id="btn-fit-screen"
          onClick={fitToScreen}
          className="p-1 rounded text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Fit Whole Topology to Screen (Auto-Center)"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Main SVG Scene */}
      <svg 
        className="w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        <defs>
          {/* Subtle drop shadows for nodes */}
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>

          {/* Glow filter for active packet particles */}
          <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Links Layer */}
        <g id="links-layer">
          {links.map((link, idx) => {
            const u = nodeMap.get(link.source);
            const v = nodeMap.get(link.target);
            if (!u || !v) return null;

            const isSevered = link.status === 'severed';
            const isBypass = link.isSyntheticBypass;
            const isForged = link.isForged;
            const isSelected = selectedLinkId === link.id;

            // Compute staggered midpoint so distance badges never overlap in dense topologies
            const isDense = links.length > 18;
            const t = isDense ? 0.35 + (idx % 3) * 0.15 : 0.5;
            const midX = u.x + (v.x - u.x) * t;
            const midY = u.y + (v.y - u.y) * t;

            let strokeColor = '#A1A1A6'; // subtle gray
            if (isSevered) strokeColor = '#FF3B30'; // System Red
            else if (isForged) strokeColor = '#AF52DE'; // Purple malicious
            else if (isBypass) strokeColor = '#007AFF'; // System Blue bypass
            else if (isSelected) strokeColor = '#007AFF';
            else if (link.currentFlowMbps > 400) strokeColor = '#FF9500'; // high traffic warning
            else strokeColor = '#28CD41'; // System Green

            // In dense topologies (like Fat-Tree 32 links), only show badges on a subset or on selection/bypass
            const showBadge = !isDense || isSelected || isBypass || isForged || (idx % 2 === 0);

            return (
              <g 
                key={link.id} 
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLink(link);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onToggleLinkStatus(link.id);
                }}
              >
                {/* Thick invisible hover target */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth="14"
                />

                {/* Visible link line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2.5' : isBypass ? '2' : '1.8'}
                  strokeDasharray={isSevered ? '5,5' : isBypass ? '4,3' : undefined}
                  className="transition-colors duration-200"
                />

                {/* Distance & Delay Pill at Staggered Position */}
                {showBadge && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-22"
                      y="-8"
                      width="44"
                      height="16"
                      rx="3"
                      fill={isDarkMode ? '#222225' : '#FFFFFF'}
                      stroke={strokeColor}
                      strokeWidth="1"
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      className="text-[9px] font-mono font-medium fill-neutral-700 dark:fill-neutral-300 pointer-events-none select-none"
                    >
                      {link.distanceMeters}m
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 2. Real-time Discrete-Event Animated Packets */}
        <g id="packets-layer">
          {packetAnimations.map(p => {
            const u = nodeMap.get(p.sourceId);
            const v = nodeMap.get(p.targetId);
            if (!u || !v) return null;

            const px = u.x + (v.x - u.x) * p.progress;
            const py = u.y + (v.y - u.y) * p.progress;
            const particleColor = p.isMalicious ? '#FF3B30' : p.protocol.startsWith('sOFTDP') ? '#28CD41' : '#007AFF';

            return (
              <g key={p.id} transform={`translate(${px}, ${py})`}>
                <circle
                  r="5"
                  fill={particleColor}
                  filter="url(#packet-glow)"
                  className="animate-pulse"
                />
                <circle
                  r="2.5"
                  fill="#FFFFFF"
                />
              </g>
            );
          })}
        </g>

        {/* 3. Nodes Layer */}
        <g id="nodes-layer">
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isDown = node.status === 'down';
            const isSupporting = supportingSwitchIds.includes(node.id);
            const isFather = fatherNodeIds.includes(node.id);

            // Role styling
            let nodeBg = isDarkMode ? '#252528' : '#FFFFFF';
            let nodeBorder = isDarkMode ? '#3A3A3C' : '#D1D1D6';
            let roleBadge = 'SW';

            if (node.role === 'core') {
              roleBadge = 'CORE';
              nodeBorder = '#007AFF';
            } else if (node.role === 'dist') {
              roleBadge = 'DIST';
              nodeBorder = '#5856D6';
            } else if (node.role === 'access') {
              roleBadge = 'ACC';
              nodeBorder = '#8E8E93';
            } else if (node.role === 'controller') {
              roleBadge = 'CTRL';
              nodeBorder = '#FF9500';
            }

            if (isDown) {
              nodeBorder = '#FF3B30';
              nodeBg = isDarkMode ? '#3A1414' : '#FFEBEB';
            } else if (isSelected) {
              nodeBorder = '#007AFF';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-move select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingNodeId(node.id);
                }}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Supporting Switch Badge (Im-OFDP) */}
                {isSupporting && (
                  <circle
                    r="21"
                    fill="none"
                    stroke="#007AFF"
                    strokeWidth="1.8"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Node Body Circle */}
                <circle
                  r="17"
                  fill={nodeBg}
                  stroke={isSupporting ? '#007AFF' : nodeBorder}
                  strokeWidth={isSupporting ? '2.5' : '2'}
                  filter="url(#node-shadow)"
                  className="transition-all duration-150"
                />

                {/* Role Icon / Device Indicator */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold pointer-events-none select-none ${
                    isDown ? 'fill-[#FF3B30]' : isSelected ? 'fill-[#007AFF]' : 'fill-neutral-800 dark:fill-neutral-200'
                  }`}
                >
                  {node.id}
                </text>

                {/* Node Label underneath */}
                <g transform="translate(0, 27)">
                  <rect
                    x="-42"
                    y="-8"
                    width="84"
                    height="16"
                    rx="3"
                    fill={isDarkMode ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'}
                    stroke={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className="text-[9px] font-sans font-medium fill-neutral-700 dark:fill-neutral-300 pointer-events-none truncate"
                  >
                    {node.label.length > 14 ? node.label.substring(0, 13) + '…' : node.label}
                  </text>
                </g>

                {/* Im-OFDP Supporting Switch Pill */}
                {isSupporting && (
                  <g transform="translate(14, -14)">
                    <circle r="7" fill="#007AFF" />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-white pointer-events-none"
                    >
                      Nx
                    </text>
                  </g>
                )}

                {/* SD-TDP Father Node Pill */}
                {isFather && (
                  <g transform="translate(-14, -14)">
                    <circle r="7" fill="#5856D6" />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-white pointer-events-none"
                    >
                      FN
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
