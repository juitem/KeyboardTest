
import React from 'react';
import { Platform, KeyStats } from '../types';

interface KeyProps {
  code: string;
  label: string;
  macLabel?: string;
  platform: Platform;
  isPressed: boolean;
  isActivated: boolean;
  width?: number;
  stats?: KeyStats;
}

const Key: React.FC<KeyProps> = ({ 
  code, 
  label, 
  macLabel, 
  platform, 
  isPressed, 
  isActivated, 
  width = 1,
  stats
}) => {
  if (code === 'spacer') {
    return <div style={{ flex: width, minWidth: `${width * 40}px` }} className="h-10 pointer-events-none" />;
  }

  const displayText = (platform === Platform.MacOS && macLabel) ? macLabel : label;

  return (
    <div
      style={{ 
        flex: width, 
        minWidth: `${width * 40}px`,
        transition: 'all 0.05s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className={`
        h-14 flex flex-col items-center justify-center rounded-md border-2 text-[11px] font-bold uppercase select-none mono relative
        ${isPressed 
          ? 'bg-emerald-500 text-white border-emerald-300 scale-95 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10' 
          : isActivated 
            ? 'bg-slate-700 text-emerald-400 border-slate-500' 
            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}
      `}
    >
      <span className="text-center truncate px-1 leading-tight">
        {displayText}
      </span>
      
      {isActivated && stats && (
        <div className="absolute bottom-1 w-full px-1 flex justify-between items-center opacity-80 scale-[0.8] origin-bottom">
          <span className="text-[8px] font-mono">
            {stats.lastLatency !== null ? `${Math.round(stats.lastLatency)}ms` : ''}
          </span>
          {stats.maxCPS > 0 && (
            <span className="text-[8px] font-mono text-emerald-300">
              {stats.maxCPS.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Key;
