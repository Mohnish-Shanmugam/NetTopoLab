import React from 'react';
import { 
  AttackScenario, 
  TopologyNode, 
  TopologyLink 
} from '../../types';
import { 
  ATTACK_SCENARIOS, 
  DEFENSE_MATRIX 
} from '../../engine/securityEngine';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock,
  Radio,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

interface SecurityLabViewProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  activeAttackId: string | null;
  onTriggerAttack: (attackId: string) => void;
  isDarkMode?: boolean;
}

export const SecurityLabView: React.FC<SecurityLabViewProps> = ({
  nodes,
  links,
  activeAttackId,
  onTriggerAttack,
  isDarkMode = false
}) => {
  const attackVulnerabilityData = DEFENSE_MATRIX.map(m => ({
    name: m.attackType.split(' ')[0],
    fullName: m.attackType,
    ofdpAcceptance: m.ofdpAcceptancePct,
    imOfdpAcceptance: m.imOfdpAcceptancePct,
    softdpAcceptance: m.softdpAcceptancePct
  }));

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-6 font-sans select-text">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 gap-3">
        <div>
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
            <ShieldAlert className="text-[#FF3B30]" size={18} />
            <span>SDN Topology Security Attack & Countermeasure Lab (Red / Blue Team)</span>
          </h2>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Evaluate cleartext LLDP vulnerabilities, Out-of-Band Relay attacks, and Controller DoS Flooding (Azzouni et al. & Gu et al.)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#FF3B30]/15 text-[#FF3B30] font-medium border border-[#FF3B30]/20">
            Adversary Threat Vector Active
          </span>
        </div>
      </div>

      {/* 4 ATTACK SCENARIO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
        {ATTACK_SCENARIOS.map(atk => {
          const isActive = activeAttackId === atk.id;
          return (
            <div
              key={atk.id}
              className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-[#FF3B30]/10 border-[#FF3B30] shadow-sm'
                  : 'bg-white dark:bg-[#202022] border-black/10 dark:border-white/10'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#FF3B30] text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {isActive ? 'INJECTING' : 'IDLE'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Target: {atk.target}</span>
                </div>

                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-[13px]">
                  {atk.name}
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {atk.description}
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => onTriggerAttack(atk.id)}
                  className={`w-full py-1.5 rounded font-medium text-[11px] flex items-center justify-center space-x-1 border transition-colors ${
                    isActive
                      ? 'bg-[#FF3B30] text-white border-[#E0352A]'
                      : 'bg-white dark:bg-[#2C2C2E] text-neutral-800 dark:text-neutral-200 border-black/10 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-[#38383A]'
                  }`}
                >
                  <Play size={11} />
                  <span>{isActive ? 'Active Malicious Flood' : 'Launch Red-Team Attack'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ATTACK ACCEPTANCE / VULNERABILITY COMPARISON CHART */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHART: ATTACK ACCEPTANCE RATE */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200">
              Attack Acceptance & Graph Poisoning Rate (%)
            </span>
            <span className="text-[10px] font-mono text-neutral-400">0% = Completely Secure</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackVulnerabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: isDarkMode ? '#A1A1A6' : '#6E6E73' }} />
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
                <Bar dataKey="ofdpAcceptance" name="Standard OFDP (Vulnerable)" fill="#FF3B30" radius={[3, 3, 0, 0]} />
                <Bar dataKey="imOfdpAcceptance" name="Im-OFDP (Gu et al.)" fill="#007AFF" radius={[3, 3, 0, 0]} />
                <Bar dataKey="softdpAcceptance" name="sOFTDP (Azzouni et al.)" fill="#28CD41" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RELAY ATTACK BREAKTHROUGH ANALYSIS */}
        <div className="bg-white dark:bg-[#202022] p-4 rounded-lg border border-black/10 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-black/5 dark:border-white/5">
            <span className="font-semibold text-[13px] text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5">
              <Zap size={14} className="text-[#FF9500]" />
              <span>The Out-of-Band LLDP Relay Dilemma</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF9500]/15 text-[#FF9500] font-bold">
              Critical Cryptographic Insight
            </span>
          </div>

          <div className="text-[11px] text-neutral-600 dark:text-neutral-300 space-y-2 leading-relaxed">
            <p>
              In an <strong>Out-of-Band Relay Attack</strong>, colluding compromised hosts sniff authentic LLDP frames from an access switch and tunnel them across an external GRE/UDP pipe to another distant switch.
            </p>
            <div className="p-2.5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded text-[#FF3B30] font-medium text-[11px]">
              ⚠️ <strong>Why Cryptographic HMAC Fails:</strong> Because the relayed LLDP packet was generated genuinely by the SDN controller, its cryptographic HMAC token remains 100% valid! Static or dynamic HMAC does NOT prevent relay attacks.
            </div>
            <p>
              <strong>How Our Architecture Defeats It:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 dark:text-neutral-300 pl-1">
              <li>
                <strong className="text-[#007AFF]">Im-OFDP Defense:</strong> Rule II forces incoming switches to bounce frames back with rewritten source MAC <code className="font-mono text-[10px]">mod_dl_src=MAC(in_port)</code>. The controller verifies that the received port matches the egress port, instantly detecting relay mismatch.
              </li>
              <li>
                <strong className="text-[#28CD41]">sOFTDP Defense:</strong> Switch ports install a <code className="font-mono text-[10px]">drop_lldp</code> rule. LLDP transmission is ONLY temporarily allowed within a 500ms window following a genuine hardware <code className="font-mono text-[10px]">PORT_UP</code> interrupt.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE SECURITY DEFENSE MATRIX */}
      <div className="bg-white dark:bg-[#202022] rounded-lg border border-black/10 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F5F5F7] dark:bg-[#262629] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <span className="font-semibold text-[12px] text-neutral-800 dark:text-neutral-200">
            Threat & Defense Matrix: Standard OFDP vs. Im-OFDP vs. sOFTDP
          </span>
          <span className="text-[10px] font-mono text-neutral-500">Azzouni et al. 2017 & Gu et al. 2018</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="bg-[#EFEFF4] dark:bg-[#2C2C2E] text-neutral-600 dark:text-neutral-400 text-[10px]">
              <tr>
                <th className="py-2 px-3 font-semibold">Attack Vector</th>
                <th className="py-2 px-3 font-semibold">Standard OFDP</th>
                <th className="py-2 px-3 font-semibold">Im-OFDP Defense</th>
                <th className="py-2 px-3 font-semibold">sOFTDP Defense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {DEFENSE_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                    <div>{row.attackType}</div>
                    <div className="text-[10px] font-sans font-normal text-neutral-500">{row.threatDescription}</div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[#FF3B30] font-bold flex items-center space-x-1">
                      <Unlock size={11} />
                      <span>{row.ofdpVulnerability} ({row.ofdpAcceptancePct}%)</span>
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[#007AFF] font-bold flex items-center space-x-1">
                      <Lock size={11} />
                      <span>{row.imOfdpDefense} ({row.imOfdpAcceptancePct}%)</span>
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[#28CD41] font-bold flex items-center space-x-1">
                      <ShieldCheck size={11} />
                      <span>{row.softdpDefense} ({row.softdpAcceptancePct}%)</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
