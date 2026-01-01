
import React from 'react';

interface StatusPanelProps {
  lastPressed: string | null;
  count: number;
  globalMaxCPS: number;
  avgLatency: number;
  onReset: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ 
  lastPressed, 
  count, 
  globalMaxCPS,
  avgLatency,
  onReset, 
  onToggleSound, 
  soundEnabled 
}) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-md flex flex-col lg:flex-row justify-between items-center gap-6 w-full max-w-6xl mx-auto shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center w-full lg:w-auto">
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Keys Active</p>
          <p className="text-2xl font-black text-emerald-400 mono leading-none">{count} <span className="text-slate-600 text-xs">/ 87</span></p>
        </div>
        
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Max Speed</p>
          <p className="text-2xl font-black text-blue-400 mono leading-none">{globalMaxCPS.toFixed(1)} <span className="text-slate-600 text-xs text-nowrap">CPS</span></p>
        </div>

        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Avg Latency</p>
          <p className="text-2xl font-black text-orange-400 mono leading-none">{avgLatency > 0 ? Math.round(avgLatency) : '--'} <span className="text-slate-600 text-xs">ms</span></p>
        </div>

        <div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Last Code</p>
          <p className="text-lg font-bold text-slate-100 mono truncate max-w-[120px]">
            {lastPressed || '--'}
          </p>
        </div>
      </div>

      <div className="flex gap-3 w-full lg:w-auto justify-end">
        <button
          onClick={onToggleSound}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border flex-1 lg:flex-none ${
            soundEnabled 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-slate-700 text-slate-400 border-slate-600'
          }`}
        >
          {soundEnabled ? '🔊 Sound' : '🔇 Muted'}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex-1 lg:flex-none"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default StatusPanel;
