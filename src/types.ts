export type AppId = 'calc' | 'paint' | 'notepad' | 'wordpad' | 'terminal' | 'explorer' | 'clock' | 'settings' | 'calendar' | 'cardfile' | 'clipboard' | 'siglivechat';

export interface WindowTab {
  id: string;
  appId: AppId;
  title: string;
  props?: any;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen?: boolean;
  themeColor?: string;
  tabs?: WindowTab[];
  activeTabId?: string;
  props?: any;
}

export interface FileItem {
  name: string;
  id?: AppId;
  content?: string;
  isSystem?: boolean;
}

export interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
}

