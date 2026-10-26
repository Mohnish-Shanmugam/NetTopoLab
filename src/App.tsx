import React, { useState, useEffect, useRef } from 'react';
import { 
  MainViewTab, 
  PresetKey, 
  TopologyNode, 
  TopologyLink, 
  PacketTrace, 
  ActivePacketAnimation,
  PacketProtocol
} from './types';
import { getTopologyPreset } from './engine/topologyPresets';
import { 
  runPrinceFourStepUpgrade, 
  UpgraderStepResult, 
  PsuScorecard,
  checkConnectivity 
} from './engine/hybridUpgrader';
import { 
  evaluateAllProtocols, 
  generateInitialPacketTraces 
} from './engine/discoveryEngine';
import { generateAttackPackets } from './engine/securityEngine';

import { MacTitlebar } from './components/MacTitlebar';
import { MacSidebar } from './components/MacSidebar';
import { InspectorPanel } from './components/InspectorPanel';
import { TopologyStudioView } from './components/views/TopologyStudioView';
import { SdnDiscoveryView } from './components/views/SdnDiscoveryView';
import { SecurityLabView } from './components/views/SecurityLabView';
import { RoutingMeshView } from './components/views/RoutingMeshView';
import { ExportCenterView } from './components/views/ExportCenterView';

export function App() {
  // Navigation & Preset State
  const [activeTab, setActiveTab] = useState<MainViewTab>('topology_studio');
  const [currentPreset, setCurrentPreset] = useState<PresetKey>('psu');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Active Topology State
  const [nodes, setNodes] = useState<TopologyNode[]>(() => getTopologyPreset('psu').nodes);
  const [links, setLinks] = useState<TopologyLink[]>(() => getTopologyPreset('psu').links);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>('R1');
  const [selectedLinkId, setSelectedLinkId] = useState<string | undefined>(undefined);

  // Protocol & Security State
  const [selectedProtocol, setSelectedProtocol] = useState<string>('im-ofdp');
  const [activeAttackId, setActiveAttackId] = useState<string | null>(null);

  // Prince et al. Upgrader State
  const [isUpgraded, setIsUpgraded] = useState<boolean>(false);
  const [upgraderSteps, setUpgraderSteps] = useState<UpgraderStepResult[]>([]);
  const [psuScorecard, setPsuScorecard] = useState<PsuScorecard[]>(() => {
    return runPrinceFourStepUpgrade(getTopologyPreset('psu').nodes, getTopologyPreset('psu').links).scorecard;
  });

  // Drawer & Simulation State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [packets, setPackets] = useState<PacketTrace[]>(() => generateInitialPacketTraces());
  const [packetAnimations, setPacketAnimations] = useState<ActivePacketAnimation[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 5>(1);
  const [simStep, setSimStep] = useState<number>(10);

  // Set dark mode class on HTML document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load Preset
  const handleSelectPreset = (key: PresetKey) => {
    setCurrentPreset(key);
    const data = getTopologyPreset(key);
    setNodes(data.nodes);
    setLinks(data.links);
    setSelectedNodeId(data.nodes[0]?.id);
    setSelectedLinkId(undefined);
    setIsUpgraded(false);
    setUpgraderSteps([]);
    const upgradeRes = runPrinceFourStepUpgrade(data.nodes, data.links);
    setPsuScorecard(upgradeRes.scorecard);
  };

  // Run 4-Step Upgrader
  const handleRunUpgrader = () => {
    const res = runPrinceFourStepUpgrade(nodes, links);
    setLinks(res.finalLinks);
    setUpgraderSteps(res.steps);
    setPsuScorecard(res.scorecard);
    setIsUpgraded(true);

    // Add info packet trace
    setPackets(prev => [
      ...prev,
      {
        no: prev.length + 1,
        timeMs: Number((simStep * 10).toFixed(2)),
        source: 'Topology Synthesizer',
        destination: 'Campus Network',
        protocol: 'OFDP',
        length: 120,
        info: 'Prince et al. 4-Step Hybrid Upgrade Completed: Added inter-faculty bypass & core biconnectivity.',
        tlvPayload: {
          'Single-Link Survivability': '100% Protected',
          'Single-Node Survivability': '2-Vertex Biconnected',
          'Hop Count': 'Reduced to 89 hops'
        }
      }
    ]);
  };

  // Trigger Red-Team Security Attack
  const handleTriggerAttack = (attackId: string) => {
    setActiveAttackId(attackId);
    const attackPackets = generateAttackPackets(attackId, simStep);
    setPackets(prev => [...prev, ...attackPackets]);

    // Animate attack packet on canvas
    const activeLinks = links.filter(l => l.status !== 'severed');
    if (activeLinks.length > 0) {
      const link = activeLinks[Math.floor(Math.random() * activeLinks.length)];
      setPacketAnimations(prev => [
        ...prev,
        {
          id: `anim-atk-${Date.now()}`,
          packetNo: simStep,
          sourceId: link.source,
          targetId: link.target,
          protocol: 'ATTACK-SPOOF',
          progress: 0,
          isMalicious: true
        }
      ]);
    }
  };

  // Node position drag
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  };

  // Toggle link status (sever / restore)
  const handleToggleLinkStatus = (linkId: string) => {
    setLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        const nextStatus = l.status === 'severed' ? 'up' : 'severed';
        return { ...l, status: nextStatus };
      }
      return l;
    }));

    const targetLink = links.find(l => l.id === linkId);
    if (targetLink) {
      const nextStatus = targetLink.status === 'severed' ? 'RESTORED' : 'SEVERED';
      setPackets(prev => [
        ...prev,
        {
          no: prev.length + 1,
          timeMs: Number((simStep * 10).toFixed(2)),
          source: targetLink.source,
          destination: targetLink.target,
          protocol: 'sOFTDP-BFD',
          length: 64,
          info: `FAULT EVENT: Physical Link ${targetLink.source} <-> ${targetLink.target} ${nextStatus}! Triggered BFD alarm.`,
          tlvPayload: {
            'Event': `LINK_${nextStatus}`,
            'Action': nextStatus === 'SEVERED' ? 'Local Fast-Failover bucket reroute' : 'PORT_UP 500ms learn timer'
          }
        }
      ]);
    }
  };

  // Toggle node status (up / down)
  const handleToggleNodeStatus = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'down' ? 'up' : 'down';
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  // Step simulation forward
  const handleSimStep = () => {
    setSimStep(s => s + 1);

    // Pick a random active link to animate a packet
    const activeLinks = links.filter(l => l.status !== 'severed');
    if (activeLinks.length > 0) {
      const l = activeLinks[Math.floor(Math.random() * activeLinks.length)];
      const protoList: PacketProtocol[] = ['OFDP', 'Im-OFDP', 'sOFTDP-BFD', 'OSPFv2'];
      const chosenProto = protoList[Math.floor(Math.random() * protoList.length)];

      const newAnim: ActivePacketAnimation = {
        id: `anim-${Date.now()}-${Math.random()}`,
        packetNo: simStep,
        sourceId: l.source,
        targetId: l.target,
        protocol: chosenProto,
        progress: 0,
        isMalicious: false
      };

      setPacketAnimations(prev => [...prev, newAnim]);

      // Add corresponding packet to inspector drawer
      setPackets(prev => [
        ...prev,
        {
          no: prev.length + 1,
          timeMs: Number((simStep * 5 + Math.random() * 2).toFixed(2)),
          source: `${l.source} (eth1)`,
          destination: `${l.target} (eth0)`,
          protocol: chosenProto,
          length: 96,
          info: `${chosenProto} Frame Transfer [Distance ${l.distanceMeters}m, Delay ${l.delayMs}ms]`
        }
      ]);
    }
  };

  // Animation Loop for packet particles
  useEffect(() => {
    let animId: number;
    const interval = isRunning ? 50 / speed : 100;

    const timer = setInterval(() => {
      if (isRunning) {
        handleSimStep();
      }

      // Update particle progress
      setPacketAnimations(prev => 
        prev
          .map(p => ({ ...p, progress: p.progress + 0.12 * speed }))
          .filter(p => p.progress < 1.0)
      );
    }, interval);

    return () => clearInterval(timer);
  }, [isRunning, speed, links, simStep]);

  // CLI Command Execution Parser
  const handleExecuteCli = (cmd: string): string => {
    const trimmed = cmd.trim().toLowerCase();
    if (trimmed === 'help') {
      return `NetTopoLab CLI Commands:
  help                     - List available CLI diagnostic commands
  pingall                  - Test reachability across all campus nodes
  dpctl dump-flows         - Dump OpenFlow 1.3 flow table and Im-OFDP rules
  show ip route            - Display active campus routing table
  show ip ospf neighbor    - Show OSPFv2 neighbor state and MD5 authentication
  run-upgrader             - Run Prince et al. 4-step failure tolerance synthesizer
  benchmark-all            - Execute CLI benchmark across all 5 discovery protocols
  clear                    - Clear terminal console`;
    } else if (trimmed === 'pingall') {
      const activeCount = nodes.filter(n => n.status !== 'down').length;
      const isConnected = checkConnectivity(nodes, links);
      return `*** Testing reachability among ${activeCount} campus nodes...\n` +
        `Ping: ${activeCount}/${nodes.length} hosts reachable.\n` +
        `Topology Connectivity: ${isConnected ? '100% REACHABLE (0% packet drop)' : 'PARTITIONED! Run 4-Step Upgrader to restore bypass paths.'}`;
    } else if (trimmed === 'dpctl dump-flows' || trimmed === 'dump-flows') {
      return `OFPST_FLOW reply (OF1.3) (xid=0x2):
 cookie=0x0, duration=14.2s, table=0, n_packets=84, priority=32768,dl_type=0x88cc,in_port=CONTROLLER actions=OUTPUT:1,2,3 (Im-OFDP Rule I)
 cookie=0x0, duration=14.2s, table=0, n_packets=192, priority=16384,dl_type=0x88cc actions=mod_dl_src=00:00:00:00:02:01,in_port (Im-OFDP Rule II Bounce)
 cookie=0x0, duration=14.2s, table=0, n_packets=310, priority=8192,dl_type=0x88cc actions=OUTPUT:CONTROLLER (Im-OFDP Rule III)
 cookie=0x0, duration=14.2s, table=0, n_packets=450, priority=65535,in_port=5,dl_type=0x88cc actions=drop (sOFTDP Host Port Defense)`;
    } else if (trimmed === 'show ip route') {
      return `Codes: C - connected, S - static, O - OSPF, E - EIGRP, * - candidate default
Gateway of last resort is 10.0.0.1 to network 0.0.0.0

C    10.0.0.0/24 is directly connected, GigabitEthernet0/0/0 (Core Backbone)
O    10.0.1.0/24 [110/2] via 10.0.0.1, 00:14:22, GigabitEthernet0/0/1 (Natural Sciences)
O    10.0.2.0/24 [110/2] via 10.0.0.2, 00:14:22, GigabitEthernet0/0/2 (Management Sciences)
E    10.0.3.0/24 [90/28160] via 10.0.0.1, 00:14:20, GigabitEthernet0/0/3 (Social Sciences)
O    10.0.4.0/24 [110/3] via 10.0.0.2, 00:14:18, GigabitEthernet0/0/4 (Faculty of Arts)`;
    } else if (trimmed === 'show ip ospf neighbor') {
      return `Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.0.2          1   FULL/BDR        00:00:36    10.0.0.2        GigabitEthernet0/0/0
10.0.1.1          1   FULL/DROTHER    00:00:32    10.0.1.1        GigabitEthernet0/0/1
Authentication: Cryptographic MD5 Key-ID 1 (psu-campus-secure) - VALID`;
    } else if (trimmed === 'run-upgrader') {
      handleRunUpgrader();
      return `[+] Prince et al. 4-step upgrader executed successfully. 100% Single-Link and Single-Node biconnectivity synthesized.`;
    } else if (trimmed === 'benchmark-all') {
      const evalRes = evaluateAllProtocols(nodes, links);
      return `=== DISCOVERY BENCHMARK RESULTS ===\n` +
        `Standard OFDP : ${evalRes.ofdp.totalMessages} msgs (Baseline)\n` +
        `OFDPv2        : ${evalRes.ofdpv2.totalMessages} msgs (${evalRes.ofdpv2.efficiencyGainPct}% gain)\n` +
        `Im-OFDP       : ${evalRes.imOfdp.metrics.totalMessages} msgs (${evalRes.imOfdp.gainOverOfdp}% gain)\n` +
        `sOFTDP (BFD)  : 0 periodic msgs (100% gain, 3.25ms failover)\n` +
        `SD-TDP        : ${evalRes.sdTdp.totalAgentPackets} msgs (${evalRes.sdTdp.metrics.efficiencyGainPct}% gain)`;
    } else if (trimmed === 'clear') {
      return 'Console cleared.';
    } else {
      return `command not recognized: '${cmd}'. Type 'help' for available commands.`;
    }
  };

  // Supporting switch & Father node IDs for canvas badges
  const discoveryAnalysis = evaluateAllProtocols(nodes, links);
  const supportingSwitchIds = discoveryAnalysis.imOfdp.supportingSwitchIds;
  const fatherNodeIds = discoveryAnalysis.sdTdp.fatherNodeIds;

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedLink = links.find(l => l.id === selectedLinkId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#E5E5E7] dark:bg-[#121212] overflow-hidden">
      {/* 1. macOS Titlebar & Unified Toolbar */}
      <MacTitlebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onStep={handleSimStep}
        onReset={() => {
          setIsRunning(false);
          handleSelectPreset(currentPreset);
          setPackets(generateInitialPacketTraces());
          setPacketAnimations([]);
        }}
        speed={speed}
        onToggleSpeed={() => setSpeed(s => s === 1 ? 5 : 1)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        documentTitle={`${currentPreset.toUpperCase()}-Hybrid-Campus.topo — Edited`}
      />

      {/* 2. Main Horizontal Workspace: Sidebar + Center Content + Inspector Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left macOS Vibrancy Sidebar */}
        {isSidebarOpen && (
          <MacSidebar
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedProtocol={selectedProtocol}
            onSelectProtocol={setSelectedProtocol}
            activeAttackId={activeAttackId}
            onTriggerAttack={handleTriggerAttack}
          />
        )}

        {/* Center Main View Switcher */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'topology_studio' && (
            <TopologyStudioView
              nodes={nodes}
              links={links}
              onSelectNode={(node) => {
                setSelectedNodeId(node.id);
                setSelectedLinkId(undefined);
              }}
              onSelectLink={(link) => {
                setSelectedLinkId(link.id);
                setSelectedNodeId(undefined);
              }}
              onToggleLinkStatus={handleToggleLinkStatus}
              onToggleNodeStatus={handleToggleNodeStatus}
              onUpdateNodePosition={handleUpdateNodePosition}
              selectedNodeId={selectedNodeId}
              selectedLinkId={selectedLinkId}
              supportingSwitchIds={supportingSwitchIds}
              fatherNodeIds={fatherNodeIds}
              packetAnimations={packetAnimations}
              packets={packets}
              onClearPackets={() => setPackets([])}
              isDrawerOpen={isDrawerOpen}
              onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
              onExecuteCliCommand={handleExecuteCli}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'sdn_discovery' && (
            <SdnDiscoveryView
              nodes={nodes}
              links={links}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'security_lab' && (
            <SecurityLabView
              nodes={nodes}
              links={links}
              activeAttackId={activeAttackId}
              onTriggerAttack={handleTriggerAttack}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'routing_mesh' && (
            <RoutingMeshView
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'export_center' && (
            <ExportCenterView
              nodes={nodes}
              links={links}
              isDarkMode={isDarkMode}
            />
          )}
        </main>

        {/* Right macOS Xcode-Style Inspector Panel (always available for contextual inspection) */}
        {activeTab === 'topology_studio' && (
          <InspectorPanel
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            onToggleNodeStatus={handleToggleNodeStatus}
            onToggleLinkStatus={handleToggleLinkStatus}
            onRunUpgrader={handleRunUpgrader}
            upgraderSteps={upgraderSteps}
            psuScorecard={psuScorecard}
            isUpgraded={isUpgraded}
          />
        )}
      </div>
    </div>
  );
}

export default App;
