
export enum Platform {
  Windows = 'windows',
  MacOS = 'macos'
}

export interface KeyConfig {
  code: string;
  label: string;
  macLabel?: string;
  width?: number; // Relative width (1 = standard key)
  className?: string;
}

export type KeyboardLayout = KeyConfig[][];

export interface KeyStats {
  lastLatency: number | null; // Duration of press in ms
  pressCount: number;
  maxCPS: number;
}

export interface KeyboardState {
  pressedKeys: Set<string>;
  activatedKeys: Set<string>;
  lastKeyPressed: string | null;
  platform: Platform;
  soundEnabled: boolean;
  keyStats: Record<string, KeyStats>;
  globalMaxCPS: number;
}
