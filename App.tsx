
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { KEYBOARD_87_LAYOUT } from './constants';
import { Platform, KeyboardState, KeyStats } from './types';
import Key from './components/Key';
import StatusPanel from './components/StatusPanel';
import { RotateCcw, Monitor, Laptop, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<KeyboardState>({
    pressedKeys: new Set(),
    activatedKeys: new Set(),
    lastKeyPressed: null,
    platform: Platform.Windows,
    soundEnabled: true,
    keyStats: {},
    globalMaxCPS: 0,
  });

  const downTimes = useRef<Map<string, number>>(new Map());
  const lastDownTimes = useRef<Map<string, number>>(new Map()); // For CPS calculation
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!state.soundEnabled) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [state.soundEnabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Prevent default for some system keys to make testing easier
    const sysKeys = ['F1', 'F3', 'F6', 'F7', 'Tab', 'Alt', 'Meta'];
    if (sysKeys.includes(e.key) || e.code === 'ContextMenu') {
       e.preventDefault();
    }

    const now = performance.now();
    
    setState(prev => {
      const isRepeat = prev.pressedKeys.has(e.code);
      if (isRepeat) return prev; // Ignore OS auto-repeat for latency/CPS

      playClickSound();
      
      const nextPressed = new Set(prev.pressedKeys).add(e.code);
      const nextActivated = new Set(prev.activatedKeys).add(e.code);
      
      downTimes.current.set(e.code, now);
      
      const lastDown = lastDownTimes.current.get(e.code);
      let currentCPS = 0;
      if (lastDown) {
        const interval = now - lastDown;
        if (interval > 0) currentCPS = 1000 / interval;
      }
      lastDownTimes.current.set(e.code, now);

      const existingStats = prev.keyStats[e.code] || { lastLatency: null, pressCount: 0, maxCPS: 0 };
      const newStats: KeyStats = {
        ...existingStats,
        pressCount: existingStats.pressCount + 1,
        maxCPS: Math.max(existingStats.maxCPS, currentCPS)
      };

      return {
        ...prev,
        pressedKeys: nextPressed,
        activatedKeys: nextActivated,
        lastKeyPressed: e.code,
        keyStats: { ...prev.keyStats, [e.code]: newStats },
        globalMaxCPS: Math.max(prev.globalMaxCPS, currentCPS)
      };
    });
  }, [playClickSound]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const now = performance.now();
    const downTime = downTimes.current.get(e.code);
    const latency = downTime ? now - downTime : null;

    setState(prev => {
      const nextPressed = new Set(prev.pressedKeys);
      nextPressed.delete(e.code);

      if (latency !== null) {
        const existingStats = prev.keyStats[e.code] || { lastLatency: null, pressCount: 0, maxCPS: 0 };
        return {
          ...prev,
          pressedKeys: nextPressed,
          keyStats: {
            ...prev.keyStats,
            [e.code]: { ...existingStats, lastLatency: latency }
          }
        };
      }

      return { ...prev, pressedKeys: nextPressed };
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => setState(prev => ({ ...prev, pressedKeys: new Set() })));
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const resetBoard = () => {
    downTimes.current.clear();
    lastDownTimes.current.clear();
    setState(prev => ({
      ...prev,
      pressedKeys: new Set(),
      activatedKeys: new Set(),
      lastKeyPressed: null,
      keyStats: {},
      globalMaxCPS: 0
    }));
  };

  // Fixed typing error by explicitly casting Object.values to KeyStats[]
  const avgLatency = useMemo(() => {
    const values = (Object.values(state.keyStats) as KeyStats[])
      .map(s => s.lastLatency)
      .filter((l): l is number => l !== null);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }, [state.keyStats]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              KeyPulse <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">Turbo</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Performance Keyboard Tester</p>
          </div>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setState(s => ({ ...s, platform: Platform.Windows }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.platform === Platform.Windows ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Monitor size={16} /> Windows
          </button>
          <button 
            onClick={() => setState(s => ({ ...s, platform: Platform.MacOS }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${state.platform === Platform.MacOS ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Laptop size={16} /> MacOS
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl flex flex-col gap-6">
        <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative">
          <div className="absolute top-4 right-8 flex gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest pointer-events-none">
            <span>Mechanical Precision</span>
            <span>Polling: ~1000Hz (OS Dependent)</span>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            {KEYBOARD_87_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 w-full">
                {row.map((key, keyIndex) => (
                  <Key
                    key={`${rowIndex}-${keyIndex}`}
                    code={key.code}
                    label={key.label}
                    macLabel={key.macLabel}
                    platform={state.platform}
                    isPressed={state.pressedKeys.has(key.code)}
                    isActivated={state.activatedKeys.has(key.code)}
                    width={key.width}
                    stats={state.keyStats[key.code]}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <StatusPanel 
          lastPressed={state.lastKeyPressed} 
          count={state.activatedKeys.size}
          globalMaxCPS={state.globalMaxCPS}
          avgLatency={avgLatency}
          soundEnabled={state.soundEnabled}
          onReset={resetBoard}
          onToggleSound={() => setState(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        />

        <div className="w-full">
          <textarea 
            placeholder="Type here to measure speed and accuracy..."
            className="w-full h-20 bg-slate-800/30 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all mono resize-none text-sm"
            spellCheck={false}
          />
        </div>
      </main>

      <footer className="mt-8 text-slate-500 text-[10px] flex flex-col items-center gap-3 uppercase tracking-widest font-bold">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Pressed</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-700 border border-slate-500 rounded-full"></div> History</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-800 border border-slate-700 rounded-full"></div> Untested</span>
        </div>
        <p className="opacity-50">Metrics: ms = Hold Duration | CPS = Click per Second</p>
      </footer>
    </div>
  );
};

export default App;
