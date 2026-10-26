import React from 'react';
import { TopologyCanvas } from '../TopologyCanvas';
import { PacketInspectorDrawer } from '../PacketInspectorDrawer';
import { 
  TopologyNode, 
  TopologyLink, 
  PacketTrace, 
  ActivePacketAnimation 
} from '../../types';

interface TopologyStudioViewProps {
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
  packets: PacketTrace[];
  onClearPackets: () => void;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onExecuteCliCommand: (cmd: string) => string;
  isDarkMode?: boolean;
}

export const TopologyStudioView: React.FC<TopologyStudioViewProps> = ({
  nodes,
  links,
  onSelectNode,
  onSelectLink,
  onToggleLinkStatus,
  onToggleNodeStatus,
  onUpdateNodePosition,
  selectedNodeId,
  selectedLinkId,
  supportingSwitchIds,
  fatherNodeIds,
  packetAnimations,
  packets,
  onClearPackets,
  isDrawerOpen,
  onToggleDrawer,
  onExecuteCliCommand,
  isDarkMode = false
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Upper Half: Interactive Topology Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <TopologyCanvas
          nodes={nodes}
          links={links}
          onSelectNode={onSelectNode}
          onSelectLink={onSelectLink}
          onToggleLinkStatus={onToggleLinkStatus}
          onToggleNodeStatus={onToggleNodeStatus}
          onUpdateNodePosition={onUpdateNodePosition}
          selectedNodeId={selectedNodeId}
          selectedLinkId={selectedLinkId}
          supportingSwitchIds={supportingSwitchIds}
          fatherNodeIds={fatherNodeIds}
          packetAnimations={packetAnimations}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Bottom Half: Resizable Packet Inspector Drawer */}
      <PacketInspectorDrawer
        packets={packets}
        onClearPackets={onClearPackets}
        isOpen={isDrawerOpen}
        onToggleOpen={onToggleDrawer}
        onExecuteCliCommand={onExecuteCliCommand}
      />
    </div>
  );
};
