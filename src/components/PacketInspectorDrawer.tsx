import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Terminal, 
  Table, 
  Search, 
  Trash2, 
  Pause, 
  Play, 
  Code,
  ShieldCheck,
  Send
} from 'lucide-react';
import { PacketTrace, PacketProtocol } from '../types';

interface PacketInspectorDrawerProps {
  packets: PacketTrace[];
  onClearPackets: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onExecuteCliCommand: (cmd: string) => string;
}

export const PacketInspectorDrawer: React.FC<PacketInspectorDrawerProps> = ({
  packets,
  onClearPackets,
  isOpen,
  onToggleOpen,
  onExecuteCliCommand
}) => {
  const [activeTab, setActiveTab] = useState<'packets' | 'tlv' | 'cli'>('packets');
  const [selectedPacketNo, setSelectedPacketNo] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<string>('ALL');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cliInput, setCliInput] = useState<string>('');
  const [cliHistory, setCliHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'nettopolab --version',
      output: 'NetTopoLab v1.0.0 (Darwin Sequoia Pro x86_64/arm64) — Academic Network Simulation Engine'
    },
    {
      cmd: 'dpctl dump-flows br0',
      output: 'cookie=0x0, duration=1.2s, table=0, n_packets=42, priority=32768,dl_type=0x88cc actions=OUTPUT:ALL\ncookie=0x0, duration=1.2s, table=0, n_packets=128, priority=16384,dl_type=0x88cc actions=mod_dl_src=00:00:00:00:02:01,in_port'
    }
  ]);

  const selectedPacket = packets.find(p => p.no === selectedPacketNo) || packets[packets.length - 1];

  const filteredPackets = packets.filter(p => {
    const matchesQuery = 
      p.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.info.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProto = protocolFilter === 'ALL' || p.protocol.includes(protocolFilter);
    return matchesQuery && matchesProto;
  });

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const output = onExecuteCliCommand(cliInput.trim());
    setCliHistory(h => [...h, { cmd: cliInput.trim(), output }]);
    setCliInput('');
  };

  return (
    <div className={`flex flex-col border-t border-black/10 dark:border-white/10 bg-[#FAFAFC] dark:bg-[#1A1A1C] transition-all duration-200 z-20 ${
      isOpen ? 'h-52' : 'h-8'
    }`}>
      {/* Drawer Header Bar */}
      <div className="h-8 flex-shrink-0 flex items-center justify-between px-3 bg-[#EFEFF4]/90 dark:bg-[#232326]/90 border-b border-black/10 dark:border-white/10 text-[11px] font-sans">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
            title={isOpen ? 'Collapse Drawer' : 'Expand Drawer'}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Drawer Segmented Controls */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded border border-black/5 dark:border-white/10">
            <button
              id="tab-drawer-packets"
              onClick={() => {
                setActiveTab('packets');
                if (!isOpen) onToggleOpen();
              }}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'packets'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Table size={11} />
              <span>Packet Capture ({packets.length})</span>
            </button>

            <button
              id="tab-drawer-tlv"
              onClick={() => {
                setActiveTab('tlv');
                if (!isOpen) onToggleOpen();
              }}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'tlv'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Code size={11} />
              <span>TLV / OpenFlow Inspector</span>
            </button>

            <button
              id="tab-drawer-cli"
              onClick={() => {
                setActiveTab('cli');
                if (!isOpen) onToggleOpen();
              }}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                activeTab === 'cli'
                  ? 'bg-white dark:bg-[#323236] text-[#007AFF] dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Terminal size={11} />
              <span>CLI Inspector Console</span>
            </button>
          </div>
        </div>

        {/* Right Filter / Action Controls */}
        {isOpen && activeTab === 'packets' && (
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              <Search size={11} className="absolute left-2 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter packets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-2 py-0.5 text-[11px] font-mono bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded focus:outline-none focus:border-[#007AFF] w-40 text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="text-[11px] font-mono bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded px-1.5 py-0.5 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="ALL">All Protocols</option>
              <option value="OFDP">OFDP</option>
              <option value="Im-OFDP">Im-OFDP</option>
              <option value="sOFTDP">sOFTDP (BFD)</option>
              <option value="OSPF">OSPF</option>
              <option value="ATTACK">Malicious</option>
            </select>

            <button
              onClick={onClearPackets}
              className="p-1 rounded text-neutral-500 hover:text-[#FF3B30] hover:bg-black/5 dark:hover:bg-white/10"
              title="Clear Packet Capture Buffer"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Drawer Content Body */}
      {isOpen && (
        <div className="flex-1 overflow-hidden">
          {/* TAB 1: WIRESHARK STYLE DENSE MONOSPACE PACKET TABLE */}
          {activeTab === 'packets' && (
            <div className="h-full overflow-y-auto">
              <table className="w-full text-left font-mono text-[11px] border-collapse select-text">
                <thead className="sticky top-0 bg-[#E5E5EA] dark:bg-[#262629] text-neutral-600 dark:text-neutral-400 border-b border-black/10 dark:border-white/10 z-10 text-[10px]">
                  <tr>
                    <th className="py-1 px-2 font-medium w-12">No.</th>
                    <th className="py-1 px-2 font-medium w-20">Time (ms)</th>
                    <th className="py-1 px-2 font-medium w-36">Source</th>
                    <th className="py-1 px-2 font-medium w-36">Destination</th>
                    <th className="py-1 px-2 font-medium w-24">Protocol</th>
                    <th className="py-1 px-2 font-medium w-16">Length</th>
                    <th className="py-1 px-2 font-medium">Info / TLV Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {filteredPackets.map((pkt) => {
                    const isSelected = selectedPacketNo === pkt.no;
                    const isMalicious = pkt.isMalicious;

                    let rowBg = 'hover:bg-black/5 dark:hover:bg-white/5';
                    if (isSelected) {
                      rowBg = 'bg-[#007AFF]/15 text-[#007AFF] font-medium';
                    } else if (isMalicious) {
                      rowBg = 'bg-[#FF3B30]/10 text-[#FF3B30]';
                    }

                    return (
                      <tr
                        key={pkt.no}
                        onClick={() => setSelectedPacketNo(pkt.no)}
                        className={`cursor-pointer transition-colors ${rowBg}`}
                      >
                        <td className="py-1 px-2 tabular-nums text-neutral-500">{pkt.no}</td>
                        <td className="py-1 px-2 tabular-nums text-neutral-600 dark:text-neutral-400">{pkt.timeMs.toFixed(2)}</td>
                        <td className="py-1 px-2 truncate max-w-[140px]">{pkt.source}</td>
                        <td className="py-1 px-2 truncate max-w-[140px]">{pkt.destination}</td>
                        <td className="py-1 px-2">
                          <span className={`px-1 py-0.2 rounded text-[10px] font-semibold ${
                            pkt.protocol.startsWith('sOFTDP')
                              ? 'bg-[#28CD41]/20 text-[#28CD41]'
                              : pkt.isMalicious
                              ? 'bg-[#FF3B30]/20 text-[#FF3B30]'
                              : 'bg-[#007AFF]/20 text-[#007AFF]'
                          }`}>
                            {pkt.protocol}
                          </span>
                        </td>
                        <td className="py-1 px-2 tabular-nums">{pkt.length}</td>
                        <td className="py-1 px-2 truncate max-w-[400px] text-neutral-800 dark:text-neutral-200">
                          {pkt.info}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: TLV / OPENFLOW INSPECTOR */}
          {activeTab === 'tlv' && (
            <div className="h-full p-3 font-mono text-[11px] overflow-y-auto space-y-3">
              {selectedPacket ? (
                <div>
                  <div className="flex items-center space-x-2 pb-2 border-b border-black/10 dark:border-white/10">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Frame {selectedPacket.no}: {selectedPacket.protocol} ({selectedPacket.length} bytes on wire)
                    </span>
                    <span className="text-neutral-500">at {selectedPacket.timeMs.toFixed(2)} ms</span>
                    {selectedPacket.isMalicious && (
                      <span className="px-1.5 py-0.5 rounded bg-[#FF3B30] text-white text-[10px] font-bold">
                        MALICIOUS INJECTION
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded border border-black/5 dark:border-white/5 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-neutral-400">Layer 2 / OpenFlow Header</div>
                      <div>Source: <span className="text-[#007AFF] font-bold">{selectedPacket.source}</span></div>
                      <div>Destination: <span className="text-[#007AFF] font-bold">{selectedPacket.destination}</span></div>
                      <div>Protocol Type: <span>{selectedPacket.protocol}</span></div>
                      <div>Payload Summary: <span>{selectedPacket.info}</span></div>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded border border-black/5 dark:border-white/5 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-neutral-400">Decoded TLV Parameters</div>
                      {selectedPacket.tlvPayload ? (
                        Object.entries(selectedPacket.tlvPayload).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-neutral-500">{k}:</span>
                            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{v}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-neutral-500 italic">No custom TLV parsed for this frame.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 italic">Select a packet from the table to view its parsed OpenFlow/TLV structure.</div>
              )}
            </div>
          )}

          {/* TAB 3: CLI CONSOLE INSPECTOR */}
          {activeTab === 'cli' && (
            <div className="h-full flex flex-col p-2.5 font-mono text-[11px] bg-[#121214] text-[#33FF33] overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-1 select-text">
                {cliHistory.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="text-[#007AFF] font-semibold flex items-center space-x-1">
                      <span className="text-neutral-500">nettopolab@sequoia:~$</span>
                      <span>{item.cmd}</span>
                    </div>
                    <div className="text-neutral-300 pl-4 whitespace-pre-wrap">{item.output}</div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCliSubmit} className="mt-2 flex items-center space-x-2 pt-2 border-t border-neutral-800">
                <span className="text-[#007AFF] font-bold">nettopolab@sequoia:~$</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type 'help', 'pingall', 'dpctl dump-flows', 'show ip route'..."
                  className="flex-1 bg-transparent border-none text-[#33FF33] font-mono text-[11px] focus:outline-none"
                />
                <button type="submit" className="text-neutral-400 hover:text-white">
                  <Send size={12} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
