import React, { useState, useEffect } from 'react';
import { OSState, WindowState, AppId, FileItem } from './types';
import SigeonWindow from './SigeonWindow';
import MSpexExecutive from './apps/MSpexExecutive';
import Calculator from './apps/Calculator';
import Paint from './apps/Paint';
import Notepad from './apps/Notepad';
import Terminal from './apps/Terminal';
import ClockApp from './apps/ClockApp';
import ControlPanel from './apps/Control_Panel';
import Calendar from './apps/Calendar';
import Cardfile from './apps/Cardfile';
import Clipboard from './apps/Clipboard';
import SigLiveChat from './apps/SigLiveChat';
import SaveAsDialog from './components/SaveAsDialog';
import ConfirmDialog from './components/ConfirmDialog';

const initialFiles: FileItem[] = [
  { name: 'CALC.PEX', id: 'calc', isSystem: true },
  { name: 'PAINT.PEX', id: 'paint', isSystem: true },
  { name: 'NOTEPAD.PEX', id: 'notepad', isSystem: true },
  { name: 'WRITE.PEX', id: 'wordpad', isSystem: true },
  { name: 'TERMINAL.PEX', id: 'terminal', isSystem: true },
  { name: 'CLOCK.PEX', id: 'clock', isSystem: true },
  { name: 'CONTROL.PEX', id: 'settings', isSystem: true },
  { name: 'CALENDAR.PEX', id: 'calendar', isSystem: true },
  { name: 'CARDFILE.PEX', id: 'cardfile', isSystem: true },
  { name: 'CLIPBRD.PEX', id: 'clipboard', isSystem: true },
  { name: 'SIGLIVECHAT.PEX', id: 'siglivechat', isSystem: true },
  { name: 'EXPLORER.PEX', id: 'explorer', isSystem: true },
  { name: 'ABC.TXT', content: 'This is a sample text file.\n\nSigeon OS is great!', isSystem: false },
  { name: 'README.DOC', content: 'Welcome to Sigeon OS 2.0!\n\nThis is a documentation file.', isSystem: false },
  { name: 'CONFIG.SYS', content: 'FILES=40\nBUFFERS=30', isSystem: true },
  { name: 'AUTOEXEC.BAT', content: 'ECHO OFF\nCLS', isSystem: true },
  { name: 'KERNEL.PEX', isSystem: true },
  { name: 'SYSTEM.INI', isSystem: true },
  { name: 'SIG200.INI', isSystem: true },
];

export default function SigeonOS() {
  const [bootStage, setBootStage] = useState(0);
  const [shutdownState, setShutdownState] = useState<'none' | 'shutdown'>('none');
  const [pcName, setPcName] = useState<string>(() => localStorage.getItem('sigeon_pc_name') || '');
  const [setupMode, setSetupMode] = useState<boolean>(!localStorage.getItem('sigeon_pc_name'));
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('sigeon_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FileItem[];
        const updated = parsed.map(f => f.name === 'WIN.INI' ? { ...f, name: 'SIG200.INI' } : f);
        
        // Ensure all apps in initialFiles exist in the current files array
        const existingNames = new Set(updated.map(f => f.name.toUpperCase()));
        initialFiles.forEach(initFile => {
          if (!existingNames.has(initFile.name.toUpperCase())) {
            updated.push(initFile);
          }
        });
        return updated;
      } catch (e) {
        // fallback
      }
    }
    return initialFiles;
  });

  const [bsodState, setBsodState] = useState<boolean>(false);
  const [bsodProgress, setBsodProgress] = useState(0);

  useEffect(() => {
    if (bsodState) {
      setBsodProgress(0);
      const interval = setInterval(() => {
        setBsodProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => window.location.reload(), 500);
            return 100;
          }
          const next = p + Math.floor(Math.random() * 20) + 10;
          return next > 100 ? 100 : next;
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [bsodState]);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onYes: () => void;
    onNo: () => void;
    onCancel: () => void;
  } | null>(null);

  const [saveDialog, setSaveDialog] = useState<{
    targetWindowId: string;
    defaultAppId: 'notepad' | 'wordpad';
    content: string;
    callback?: (savedFilename: string) => void;
  } | null>(null);

  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    if (bootStage < 5) {
       const timer = setTimeout(() => {
          setBootStage(b => b + 1);
       }, 800 + Math.random() * 400);
       return () => clearTimeout(timer);
    }
  }, [bootStage]);

  const [osState, setOsState] = useState<OSState>(() => {
    const isComputer = typeof window !== 'undefined' && window.innerWidth >= 768;
    return {
      windows: [
        {
          id: 'executive-1',
          appId: 'explorer',
          title: 'MS-PEX Executive',
          x: isComputer ? 30 : 10,
          y: isComputer ? 30 : 10,
          width: isComputer ? 580 : 320,
          height: isComputer ? 400 : 240,
          zIndex: 10,
          isMinimized: false,
          isMaximized: false,
        }
      ],
      activeWindowId: 'executive-1',
      nextZIndex: 11,
    };
  });

  const bringToFront = (id: string) => {
    setOsState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === id ? { ...w, zIndex: prev.nextZIndex } : w
      ),
      activeWindowId: id,
      nextZIndex: prev.nextZIndex + 1
    }));
  };

  const closeWindow = (id: string) => {
    setOsState(prev => {
      return {
        ...prev,
        windows: prev.windows.filter(w => w.id !== id),
        activeWindowId: prev.activeWindowId === id ? null : prev.activeWindowId
      };
    });
  };

  const openApp = (appId: AppId, props?: any) => {
    const id = `${appId}-${Date.now()}`;
    const titles: Record<AppId, string> = {
      calc: 'Calculator',
      paint: 'Paint',
      notepad: 'Notepad',
      wordpad: 'Write',
      terminal: 'Terminal',
      explorer: 'MS-PEX Executive',
      clock: 'Clock',
      settings: 'Control Panel',
      calendar: 'Calendar - (untitled)',
      cardfile: 'Cardfile - (untitled)',
      clipboard: 'Clipboard',
      siglivechat: 'Live Chat'
    };

    const isComputer = typeof window !== 'undefined' && window.innerWidth >= 768;
    
    // Set explicit size for different apps
    let width = isComputer ? 500 : 320;
    let height = isComputer ? 360 : 240;

    if (appId === 'calc') {
      width = 250;
      height = 280;
    } else if (appId === 'clock') {
      width = 180;
      height = 220;
    } else if (appId === 'settings') {
      width = 440;
      height = 360;
    } else if (appId === 'calendar') {
      width = 410;
      height = 420;
    } else if (appId === 'cardfile') {
      width = 430;
      height = 310;
    } else if (appId === 'clipboard') {
      width = 280;
      height = 300;
    } else if (appId === 'siglivechat') {
      width = isComputer ? 460 : 320;
      height = isComputer ? 400 : 350;
    }

    setOsState(prev => ({
      ...prev,
      windows: [
        ...prev.windows,
        {
          id,
          appId,
          title: props?.filename ? `${titles[appId]} - ${props.filename}` : titles[appId],
          x: 40 + (prev.windows.length * 25) % 120,
          y: 40 + (prev.windows.length * 25) % 120,
          width,
          height,
          zIndex: prev.nextZIndex,
          isMinimized: false,
          isMaximized: false,
          props
        }
      ],
      activeWindowId: id,
      nextZIndex: prev.nextZIndex + 1
    }));
  };

  const openFile = (file: FileItem) => {
    if (file.id) {
       openApp(file.id);
    } else if (file.name.endsWith('.TXT')) {
       openApp('notepad', { filename: file.name, content: file.content || '', originalContent: file.content || '' });
    } else if (file.name.endsWith('.DOC')) {
       openApp('wordpad', { filename: file.name, content: file.content || '', originalContent: file.content || '' });
    } else {
       // Cannot open
    }
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setOsState(prev => ({
      ...prev,
      windows: prev.windows.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const updateTabProps = (windowId: string, tabId: string, tabProps: any) => {
    setOsState(prev => ({
      ...prev,
      windows: prev.windows.map(w => {
        if (w.id === windowId && w.tabs) {
          return {
            ...w,
            tabs: w.tabs.map(t => t.id === tabId ? { ...t, props: { ...t.props, ...tabProps } } : t)
          };
        }
        return w;
      })
    }));
  };

  const executeOSCommand = (windowId: string, tabId: string | undefined, cmdStr: string): string => {
    const parseArgs = (str: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inDoubleQuotes = false;
      let inSingleQuotes = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"' && !inSingleQuotes) {
          inDoubleQuotes = !inDoubleQuotes;
        } else if (char === "'" && !inDoubleQuotes) {
          inSingleQuotes = !inSingleQuotes;
        } else if (char === ' ' && !inDoubleQuotes && !inSingleQuotes) {
          if (current) {
            result.push(current);
            current = '';
          }
        } else {
          current += char;
        }
      }
      if (current) {
        result.push(current);
      }
      return result;
    };

    const tokens = parseArgs(cmdStr.trim());
    if (tokens.length === 0 || tokens[0].toLowerCase() !== 'wt') {
      return '';
    }

    if (tokens.length < 2) {
      return 'Usage: wt [commands...]. Try "wt help" for a list of available commands.';
    }

    const sub = tokens[1].toLowerCase();

    const titles: Record<AppId, string> = {
      calc: 'Calculator',
      paint: 'Paint',
      notepad: 'Notepad',
      wordpad: 'Write',
      terminal: 'Terminal',
      explorer: 'MS-PEX Executive',
      clock: 'Clock',
      settings: 'Control Panel',
      calendar: 'Calendar - (untitled)',
      cardfile: 'Cardfile - (untitled)',
      clipboard: 'Clipboard',
      siglivechat: 'Live Chat'
    };

    const getAppIdFromArg = (arg?: string): AppId => {
      if (!arg) return 'terminal';
      const a = arg.toLowerCase();
      if (a === 'calc' || a === 'calculator') return 'calc';
      if (a === 'paint' || a === 'mspaint') return 'paint';
      if (a === 'notepad' || a === 'note') return 'notepad';
      if (a === 'wordpad' || a === 'write') return 'wordpad';
      if (a === 'terminal' || a === 'shell' || a === 'cmd') return 'terminal';
      if (a === 'explorer' || a === 'ms-pex') return 'explorer';
      if (a === 'clock') return 'clock';
      if (a === 'settings' || a === 'control') return 'settings';
      if (a === 'calendar') return 'calendar';
      if (a === 'cardfile') return 'cardfile';
      if (a === 'clipboard') return 'clipboard';
      if (a === 'siglivechat' || a === 'livechat' || a === 'chat') return 'siglivechat';
      return 'terminal'; // fallback
    };

    if (sub === 'help' || sub === '-h' || sub === '--help') {
      return `Window & Tab Management Commands:
  wt nt [app]              Open a new tab in current window
  wt -w "Win" nt [app]     Open a new tab in specific named window
  wt -F [app]              Launch new window in Fullscreen
  wt -M [app]              Launch new window Maximized
  wt close                 Close active window
  wt close -w "Win"        Close named window
  wt list                  List all active windows & tabs
  wt rename "Title"        Rename active window
  wt rename -w "Old" "New" Rename specific window
  wt theme [color]         Set active window header theme
  wt tabnext / tn          Switch to next tab
  wt tabprev / tp          Switch to previous tab
  wt max / min / restore   Maximize, minimize or restore active window`;
    }

    if (sub === 'nt') {
      const targetApp = getAppIdFromArg(tokens[2]);
      const appName = titles[targetApp];
      let msg = '';
      setOsState(prev => {
        const win = prev.windows.find(w => w.id === windowId);
        if (!win) {
          msg = 'Error: Current window context not found.';
          return prev;
        }

        let currentTabs = win.tabs ? [...win.tabs] : [];
        if (currentTabs.length === 0) {
          currentTabs.push({
            id: `tab-orig-${Date.now()}`,
            appId: win.appId,
            title: win.title.split(' - ')[0],
            props: win.props
          });
        }

        const newTabId = `tab-${Date.now()}`;
        currentTabs.push({
          id: newTabId,
          appId: targetApp,
          title: appName,
          props: {}
        });

        msg = `Successfully added new tab "${appName}" to current window.`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === windowId ? {
            ...w,
            tabs: currentTabs,
            activeTabId: newTabId
          } : w)
        };
      });
      return msg;
    }

    if (sub === '-w') {
      const windowSearchName = tokens[2];
      const cmdAction = tokens[3]?.toLowerCase();
      if (!windowSearchName) {
        return 'Error: Please specify a window title, e.g. wt -w "Notepad" nt';
      }

      const findWindow = (wins: WindowState[]) => {
        return wins.find(w => w.title.toLowerCase().includes(windowSearchName.toLowerCase()) || 
          (w.tabs && w.tabs.some(t => t.title.toLowerCase().includes(windowSearchName.toLowerCase()))));
      };

      if (cmdAction === 'nt') {
        const targetApp = getAppIdFromArg(tokens[4]);
        const appName = titles[targetApp];
        let msg = '';
        setOsState(prev => {
          const win = findWindow(prev.windows);
          if (!win) {
            msg = `Error: Window containing "${windowSearchName}" not found.`;
            return prev;
          }

          let currentTabs = win.tabs ? [...win.tabs] : [];
          if (currentTabs.length === 0) {
            currentTabs.push({
              id: `tab-orig-${Date.now()}`,
              appId: win.appId,
              title: win.title.split(' - ')[0],
              props: win.props
            });
          }

          const newTabId = `tab-${Date.now()}`;
          currentTabs.push({
            id: newTabId,
            appId: targetApp,
            title: appName,
            props: {}
          });

          msg = `Successfully added new tab "${appName}" to window "${win.title}".`;
          return {
            ...prev,
            windows: prev.windows.map(w => w.id === win.id ? {
              ...w,
              tabs: currentTabs,
              activeTabId: newTabId
            } : w)
          };
        });
        return msg;
      } else if (cmdAction === 'close') {
        let msg = '';
        setOsState(prev => {
          const win = findWindow(prev.windows);
          if (!win) {
            msg = `Error: Window containing "${windowSearchName}" not found.`;
            return prev;
          }
          msg = `Closed window "${win.title}".`;
          return {
            ...prev,
            windows: prev.windows.filter(w => w.id !== win.id),
            activeWindowId: prev.activeWindowId === win.id ? null : prev.activeWindowId
          };
        });
        return msg;
      } else {
        return `Error: Unknown action for -w flag. Try "wt -w "${windowSearchName}" nt" or "wt -w "${windowSearchName}" close".`;
      }
    }

    if (sub === 'close') {
      if (tokens[2] === '-w') {
        const winName = tokens[3];
        if (!winName) return 'Error: Please specify window name to close.';
        let msg = '';
        setOsState(prev => {
          const win = prev.windows.find(w => w.title.toLowerCase().includes(winName.toLowerCase()));
          if (!win) {
            msg = `Error: Window with title "${winName}" not found.`;
            return prev;
          }
          msg = `Closed window "${win.title}".`;
          return {
            ...prev,
            windows: prev.windows.filter(w => w.id !== win.id),
            activeWindowId: prev.activeWindowId === win.id ? null : prev.activeWindowId
          };
        });
        return msg;
      } else {
        let msg = '';
        setOsState(prev => {
          const win = prev.windows.find(w => w.id === windowId);
          if (!win) {
            msg = 'Error: Active window context not found.';
            return prev;
          }
          msg = `Closed window "${win.title}".`;
          return {
            ...prev,
            windows: prev.windows.filter(w => w.id !== windowId),
            activeWindowId: prev.activeWindowId === windowId ? null : prev.activeWindowId
          };
        });
        return msg;
      }
    }

    if (sub === 'rename') {
      if (tokens[2] === '-w') {
        const oldName = tokens[3];
        const newName = tokens[4];
        if (!oldName || !newName) {
          return 'Usage: wt rename -w "Old Title" "New Title"';
        }
        let msg = '';
        setOsState(prev => {
          const win = prev.windows.find(w => w.title.toLowerCase().includes(oldName.toLowerCase()));
          if (!win) {
            msg = `Error: Window containing "${oldName}" not found.`;
            return prev;
          }
          msg = `Renamed window "${win.title}" to "${newName}".`;
          return {
            ...prev,
            windows: prev.windows.map(w => w.id === win.id ? { ...w, title: newName } : w)
          };
        });
        return msg;
      } else {
        const newName = tokens[2];
        if (!newName) return 'Usage: wt rename "New Title"';
        let msg = '';
        setOsState(prev => {
          const win = prev.windows.find(w => w.id === windowId);
          if (!win) {
            msg = 'Error: Current window context not found.';
            return prev;
          }
          msg = `Renamed current window to "${newName}".`;
          return {
            ...prev,
            windows: prev.windows.map(w => w.id === windowId ? { ...w, title: newName } : w)
          };
        });
        return msg;
      }
    }

    if (sub === '-f' || sub === '--fullscreen' || sub === 'fullscreen') {
      const targetApp = getAppIdFromArg(tokens[2]);
      const appName = titles[targetApp];
      const id = `${targetApp}-${Date.now()}`;
      setOsState(prev => {
        return {
          ...prev,
          windows: [
            ...prev.windows,
            {
              id,
              appId: targetApp,
              title: appName,
              x: 10,
              y: 10,
              width: 500,
              height: 360,
              zIndex: prev.nextZIndex,
              isMinimized: false,
              isMaximized: false,
              isFullscreen: true,
              props: {}
            }
          ],
          activeWindowId: id,
          nextZIndex: prev.nextZIndex + 1
        };
      });
      return `Launched a new Fullscreen window running "${appName}".`;
    }

    if (sub === '-m' || sub === '--maximized' || sub === 'maximized') {
      const targetApp = getAppIdFromArg(tokens[2]);
      const appName = titles[targetApp];
      const id = `${targetApp}-${Date.now()}`;
      setOsState(prev => {
        return {
          ...prev,
          windows: [
            ...prev.windows,
            {
              id,
              appId: targetApp,
              title: appName,
              x: 10,
              y: 10,
              width: 500,
              height: 360,
              zIndex: prev.nextZIndex,
              isMinimized: false,
              isMaximized: true,
              props: {}
            }
          ],
          activeWindowId: id,
          nextZIndex: prev.nextZIndex + 1
        };
      });
      return `Launched a new Maximized window running "${appName}".`;
    }

    if (sub === 'list' || sub === 'status') {
      let output = 'Active Sigeon OS Windows:\n';
      osState.windows.forEach((w, idx) => {
        const activeStr = osState.activeWindowId === w.id ? ' [ACTIVE]' : '';
        const stateStr = w.isFullscreen ? ' (Fullscreen)' : (w.isMaximized ? ' (Maximized)' : '');
        output += `${idx + 1}. ${w.title} - ID: ${w.id}${activeStr}${stateStr}\n`;
        if (w.tabs && w.tabs.length > 0) {
          w.tabs.forEach((tab) => {
            const activeTabStr = w.activeTabId === tab.id ? ' [ACTIVE TAB]' : '';
            output += `   └─ Tab: "${tab.title}" - App: ${tab.appId}${activeTabStr}\n`;
          });
        }
      });
      return output;
    }

    if (sub === 'max' || sub === 'maximize') {
      const winName = tokens[2];
      let msg = '';
      setOsState(prev => {
        const win = winName 
          ? prev.windows.find(w => w.title.toLowerCase().includes(winName.toLowerCase()))
          : prev.windows.find(w => w.id === windowId);
        if (!win) {
          msg = winName ? `Error: Window "${winName}" not found.` : 'Error: No active window context.';
          return prev;
        }
        msg = `Maximized window "${win.title}".`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === win.id ? { ...w, isMaximized: true, isFullscreen: false } : w)
        };
      });
      return msg;
    }

    if (sub === 'min' || sub === 'minimize') {
      const winName = tokens[2];
      let msg = '';
      setOsState(prev => {
        const win = winName 
          ? prev.windows.find(w => w.title.toLowerCase().includes(winName.toLowerCase()))
          : prev.windows.find(w => w.id === windowId);
        if (!win) {
          msg = winName ? `Error: Window "${winName}" not found.` : 'Error: No active window context.';
          return prev;
        }
        msg = `Minimized window "${win.title}".`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === win.id ? { ...w, isMinimized: true } : w)
        };
      });
      return msg;
    }

    if (sub === 'restore') {
      const winName = tokens[2];
      let msg = '';
      setOsState(prev => {
        const win = winName 
          ? prev.windows.find(w => w.title.toLowerCase().includes(winName.toLowerCase()))
          : prev.windows.find(w => w.id === windowId);
        if (!win) {
          msg = winName ? `Error: Window "${winName}" not found.` : 'Error: No active window context.';
          return prev;
        }
        msg = `Restored window "${win.title}".`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === win.id ? { ...w, isMaximized: false, isMinimized: false, isFullscreen: false } : w)
        };
      });
      return msg;
    }

    if (sub === 'theme') {
      const colorInput = tokens[2];
      if (!colorInput) {
        return `Usage: wt theme [color]. Supported presets: blue, red, green, purple, yellow, cyan, teal, or hex code (e.g. #ff0055).`;
      }
      
      const presets: Record<string, string> = {
        blue: '#0000aa',
        red: '#cc0000',
        green: '#00aa00',
        purple: '#7e22ce',
        yellow: '#eab308',
        cyan: '#06b6d4',
        teal: '#0d9488',
        black: '#000000'
      };

      const selectedColor = presets[colorInput.toLowerCase()] || colorInput;
      let msg = '';
      setOsState(prev => {
        const win = prev.windows.find(w => w.id === windowId);
        if (!win) {
          msg = 'Error: Current window context not found.';
          return prev;
        }
        msg = `Applied theme color "${colorInput}" to current window title bar.`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === windowId ? { ...w, themeColor: selectedColor } : w)
        };
      });
      return msg;
    }

    if (sub === 'tn' || sub === 'tabnext') {
      let msg = '';
      setOsState(prev => {
        const win = prev.windows.find(w => w.id === windowId);
        if (!win || !win.tabs || win.tabs.length <= 1) {
          msg = 'Error: Active window does not have multiple tabs.';
          return prev;
        }
        const currentIdx = win.tabs.findIndex(t => t.id === win.activeTabId);
        const nextIdx = (currentIdx + 1) % win.tabs.length;
        const nextTab = win.tabs[nextIdx];
        msg = `Switched to next tab: "${nextTab.title}".`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === windowId ? { ...w, activeTabId: nextTab.id } : w)
        };
      });
      return msg;
    }

    if (sub === 'tp' || sub === 'tabprev') {
      let msg = '';
      setOsState(prev => {
        const win = prev.windows.find(w => w.id === windowId);
        if (!win || !win.tabs || win.tabs.length <= 1) {
          msg = 'Error: Active window does not have multiple tabs.';
          return prev;
        }
        const currentIdx = win.tabs.findIndex(t => t.id === win.activeTabId);
        const prevIdx = (currentIdx - 1 + win.tabs.length) % win.tabs.length;
        const prevTab = win.tabs[prevIdx];
        msg = `Switched to previous tab: "${prevTab.title}".`;
        return {
          ...prev,
          windows: prev.windows.map(w => w.id === windowId ? { ...w, activeTabId: prevTab.id } : w)
        };
      });
      return msg;
    }

    return `Error: Unknown wt command. Type "wt help" for valid options.`;
  };

  const handleShutdown = () => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
    setOsState(p => ({ ...p, windows: [] }));
    setShutdownState('shutdown');
  };

  const handleRestart = () => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
    window.location.reload();
  };

  const handleDeleteFile = (fileName: string) => {
    const file = files.find(f => f.name === fileName);
    if (file && file.isSystem) {
       alert("Cannot delete system file: " + fileName);
       return;
    }
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const saveFile = (fileName: string, content: string, windowId?: string) => {
    // 1. Update virtual file list
    setFiles(prev => {
      const exists = prev.find(f => f.name === fileName);
      if (exists) {
        return prev.map(f => f.name === fileName ? { ...f, content } : f);
      }
      return [...prev, { name: fileName, content, isSystem: false }];
    });

    // 2. Sync updated props to open windows to make them "clean" (matching originalContent with content)
    setOsState(prev => {
      return {
        ...prev,
        windows: prev.windows.map(w => {
          const matchesId = windowId && w.id === windowId;
          const matchesFilename = w.props?.filename === fileName;
          if (matchesId || matchesFilename) {
            const isWordpadApp = w.appId === 'wordpad';
            const displayTitle = isWordpadApp ? `Write - ${fileName}` : `Notepad - ${fileName}`;
            return {
              ...w,
              title: displayTitle,
              props: {
                ...w.props,
                filename: fileName,
                content: content,
                originalContent: content
              }
            };
          }
          return w;
        })
      };
    });
  };

  const handleRequestSaveAs = (windowId: string, content: string, defaultExt: string, callback: (savedFilename: string) => void) => {
    setSaveDialog({
      targetWindowId: windowId,
      defaultAppId: defaultExt === 'DOC' ? 'wordpad' : 'notepad',
      content: content,
      callback: (savedName) => {
        saveFile(savedName, content, windowId);
        callback(savedName);
      }
    });
  };

  const handleCloseRequest = (id: string) => {
    const win = osState.windows.find(w => w.id === id);
    if (!win) return;

    if (win.appId === 'notepad' || win.appId === 'wordpad') {
      const content = win.props?.content || '';
      const originalContent = win.props?.originalContent || '';

      if (content !== originalContent) {
        const filename = win.props?.filename || (win.appId === 'wordpad' ? 'UNTITLED.DOC' : 'UNTITLED.TXT');
        setConfirmDialog({
          title: win.appId === 'wordpad' ? 'Write' : 'Notepad',
          message: `Save changes to ${filename}?`,
          onYes: () => {
            setConfirmDialog(null);
            if (win.props?.filename && win.props.filename !== 'UNTITLED.TXT' && win.props.filename !== 'DOCUMENT.DOC') {
              saveFile(win.props.filename, content, id);
              closeWindow(id);
            } else {
              setSaveDialog({
                targetWindowId: id,
                defaultAppId: win.appId as 'notepad' | 'wordpad',
                content: content,
                callback: (savedName) => {
                  saveFile(savedName, content, id);
                  closeWindow(id);
                }
              });
            }
          },
          onNo: () => {
            setConfirmDialog(null);
            closeWindow(id);
          },
          onCancel: () => {
            setConfirmDialog(null);
          }
        });
        return;
      }
    }

    closeWindow(id);
  };

  const triggerBsod = () => setBsodState(true);

  if (bsodState) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#1e72d2] text-white flex flex-col p-4 sm:p-8 z-[9999] font-sans overflow-hidden">
        <div className="flex flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-8 mt-2 sm:mt-12">
           <svg viewBox="0 0 16 16" fill="white" className="w-16 h-16 sm:w-[120px] sm:h-[120px] opacity-90 shrink-0" shapeRendering="crispEdges">
             <rect x="5" y="2" width="5" height="1" />
             <rect x="4" y="3" width="7" height="1" />
             <rect x="3" y="4" width="2" height="1" />
             <rect x="6" y="4" width="6" height="1" />
             <rect x="3" y="5" width="9" height="1" />
             <rect x="12" y="5" width="2" height="1" />
             <rect x="2" y="6" width="10" height="1" />
             <rect x="12" y="6" width="3" height="1" />
             <rect x="2" y="7" width="11" height="1" />
             <rect x="2" y="8" width="10" height="1" />
             <rect x="3" y="9" width="8" height="1" />
             <rect x="4" y="10" width="7" height="1" />
             <rect x="6" y="11" width="1" height="2" />
             <rect x="8" y="11" width="1" height="2" />
             <rect x="5" y="13" width="2" height="1" />
             <rect x="7" y="13" width="2" height="1" />
           </svg>
           <div className="flex flex-col items-start gap-1 sm:gap-2">
             <h1 className="text-lg sm:text-4xl font-bold bg-[#0d4c94] px-2 sm:px-4 py-1 sm:py-2 shadow-md inline-block">SigeonOS Blue Screen Of</h1>
             <h1 className="text-lg sm:text-4xl font-bold bg-[#0d4c94] px-2 sm:px-4 py-1 sm:py-2 shadow-md inline-block">Death</h1>
           </div>
        </div>
        <p className="text-base sm:text-3xl mb-4 sm:mb-8 max-w-3xl leading-snug sm:leading-relaxed">
          Your PC ran into a problem and needs to restart.<br className="hidden sm:block"/>
          We're just collecting some error info, and then we'll restart for you.
        </p>
        <p className="text-base sm:text-3xl mb-4 sm:mb-12">{bsodProgress}% complete</p>
        <div className="mt-auto text-[10px] sm:text-sm text-gray-200">
          <p>For more information about this issue and possible seeds, visit our website.</p>
          <p className="mt-2 sm:mt-4 text-[8px] sm:text-xs opacity-70">Stop code: 00420001</p>
        </div>
      </div>
    );
  }

  if (shutdownState === 'shutdown') {
    return (
      <div className="absolute inset-0 w-full h-full bg-black text-white flex items-center justify-center font-sans tracking-widest p-4 z-50">
        <div className="text-xl text-center">It is now safe to close the tab.</div>
      </div>
    );
  }

  if (bootStage < 5) {
    return (
      <div className="absolute inset-0 w-full h-full bg-black text-white flex flex-col items-center justify-center font-sans tracking-widest p-4 z-50">
         <div className="mb-6 text-white">
           <svg viewBox="0 0 16 16" fill="currentColor" className="w-16 h-16 sm:w-24 sm:h-24" shapeRendering="crispEdges">
             <rect x="5" y="2" width="5" height="1" />
             <rect x="4" y="3" width="7" height="1" />
             <rect x="3" y="4" width="2" height="1" />
             <rect x="6" y="4" width="6" height="1" />
             <rect x="3" y="5" width="9" height="1" />
             <rect x="12" y="5" width="2" height="1" />
             <rect x="2" y="6" width="10" height="1" />
             <rect x="12" y="6" width="3" height="1" />
             <rect x="2" y="7" width="11" height="1" />
             <rect x="2" y="8" width="10" height="1" />
             <rect x="3" y="9" width="8" height="1" />
             <rect x="4" y="10" width="7" height="1" />
             <rect x="6" y="11" width="1" height="2" />
             <rect x="8" y="11" width="1" height="2" />
             <rect x="5" y="13" width="2" height="1" />
             <rect x="7" y="13" width="2" height="1" />
           </svg>
         </div>
         <div className="text-3xl mb-4 text-center">Welcome to Sigeon OS 2.0.</div>
         <div className="text-xl text-[#55ff55] h-8 mt-4">
           {bootStage === 0 && "Loading KERNEL.PEX..."}
           {bootStage === 1 && "Loading SYSTEM.INI..."}
           {bootStage === 2 && "Loading SIG200.INI..."}
           {bootStage === 3 && "Loading MS-PEX Executive..."}
           {bootStage === 4 && "Starting Desktop..."}
         </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#0000aa] text-white flex flex-col items-center justify-center font-sans tracking-widest p-4 z-50 text-center">
        <h1 className="text-2xl mb-8 border-b-2 border-white pb-2">SIGEON OS 2.0 SETUP</h1>
        <p className="mb-4">Please enter a name for this computer:</p>
        <input 
          type="text" 
          value={pcName}
          onChange={e => setPcName(e.target.value)}
          className="bg-black text-white border-2 border-white p-2 outline-none text-center mb-8 w-64 max-w-full"
          maxLength={15}
          autoFocus
        />
        <button 
          className="bg-gray-300 text-black px-6 py-2 border-2 border-black active:bg-gray-500 font-bold hover:bg-white"
          onClick={() => {
            if (pcName.trim()) {
              localStorage.setItem('sigeon_pc_name', pcName.trim());
              setPcName(pcName.trim());
              setSetupMode(false);
            }
          }}
        >
          CONTINUE
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" onPointerDown={() => setOsState(p => ({...p, activeWindowId: null}))}>
      {osState.windows.map(win => {
        const getActiveAppInfo = () => {
          if (win.tabs && win.tabs.length > 0) {
            const activeTab = win.tabs.find(t => t.id === win.activeTabId) || win.tabs[0];
            return {
              appId: activeTab.appId,
              props: activeTab.props,
              activeTabId: activeTab.id
            };
          }
          return {
            appId: win.appId,
            props: win.props,
            activeTabId: undefined
          };
        };

        const appInfo = getActiveAppInfo();
        const activeAppId = appInfo.appId;
        const activeProps = appInfo.props;

        return (
          <SigeonWindow 
            key={win.id} 
            windowState={win} 
            isActive={osState.activeWindowId === win.id}
            bringToFront={() => bringToFront(win.id)}
            closeWindow={() => handleCloseRequest(win.id)}
            updateWindow={(updates) => updateWindow(win.id, updates)}
          >
            {activeAppId === 'explorer' && <MSpexExecutive files={files} openFile={openFile} deleteFile={handleDeleteFile} onShutdown={() => setShowEndSessionConfirm(true)} onRestart={handleRestart} pcName={pcName} />}
            {activeAppId === 'calc' && <Calculator />}
            {activeAppId === 'paint' && <Paint />}
            {activeAppId === 'notepad' && (
              <Notepad 
                content={activeProps?.content} 
                filename={activeProps?.filename} 
                saveFile={(filename, content) => saveFile(filename, content, win.id)}
                onChange={(text) => {
                  if (win.tabs && win.tabs.length > 0) {
                    updateTabProps(win.id, appInfo.activeTabId!, { content: text });
                  } else {
                    updateWindow(win.id, { props: { ...win.props, content: text } });
                  }
                }}
                onRequestSaveAs={(text, ext, callback) => handleRequestSaveAs(win.id, text, ext, callback)}
              />
            )}
            {activeAppId === 'wordpad' && (
              <Notepad 
                isWordpad 
                content={activeProps?.content} 
                filename={activeProps?.filename} 
                saveFile={(filename, content) => saveFile(filename, content, win.id)}
                onChange={(text) => {
                  if (win.tabs && win.tabs.length > 0) {
                    updateTabProps(win.id, appInfo.activeTabId!, { content: text });
                  } else {
                    updateWindow(win.id, { props: { ...win.props, content: text } });
                  }
                }}
                onRequestSaveAs={(text, ext, callback) => handleRequestSaveAs(win.id, text, ext, callback)}
              />
            )}
            {activeAppId === 'terminal' && (
              <Terminal 
                pcName={pcName} 
                triggerBsod={triggerBsod} 
                windowId={win.id}
                tabId={appInfo.activeTabId}
                executeOSCommand={(cmdStr) => executeOSCommand(win.id, appInfo.activeTabId, cmdStr)}
              />
            )}
            {activeAppId === 'clock' && <ClockApp />}
            {activeAppId === 'settings' && <ControlPanel pcName={pcName} setPcName={(name) => { setPcName(name); localStorage.setItem('sigeon_pc_name', name); }} />}
            {activeAppId === 'calendar' && <Calendar />}
            {activeAppId === 'cardfile' && <Cardfile />}
            {activeAppId === 'clipboard' && <Clipboard />}
            {activeAppId === 'siglivechat' && <SigLiveChat />}
          </SigeonWindow>
        );
      })}
      
      {/* Desktop Icon for MS-PEX Executive */}
      <div 
        className="absolute bottom-14 left-6 select-none flex flex-col items-center cursor-pointer group active:scale-95 transition-transform z-0"
        onDoubleClick={() => {
          const existing = osState.windows.find(w => w.appId === 'explorer');
          if (existing) {
            bringToFront(existing.id);
            updateWindow(existing.id, { isMinimized: false });
          } else {
            openApp('explorer');
          }
        }}
        title="Double click to open MS-PEX Executive"
      >
        {/* Floppy Disk Pixel-art SVG */}
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" shapeRendering="crispEdges">
          {/* Gray body */}
          <rect x="2" y="2" width="28" height="28" fill="#a3a3a3" stroke="#000000" strokeWidth="2" />
          {/* Top white sticker label */}
          <rect x="7" y="2" width="18" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2" />
          {/* Top label lines */}
          <line x1="10" y1="5" x2="22" y2="5" stroke="#0000ff" strokeWidth="1.5" />
          {/* Slider metal protector at the bottom */}
          <rect x="9" y="16" width="14" height="14" fill="#d4d4d4" stroke="#000000" strokeWidth="2" />
          {/* Slider window cutout */}
          <rect x="13" y="20" width="6" height="10" fill="#000000" />
        </svg>
        
        {/* Under the icon is the app's name inside a white box exactly as shown in Image 1 */}
        <div className="mt-1 bg-white border-2 border-black px-1.5 py-0.5 text-[11px] font-bold text-black tracking-wide text-center shadow-none">
          MS-PEX Executive
        </div>
      </div>

      {/* Minimized icons area could go at the bottom, but Windows 1.0 put them as little boxes at the bottom of the screen */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-1 bg-[#00ffff]">
         {/* Render minimized windows here if we implemented minimization */}
      </div>

      {/* Save As Dialog */}
      <SaveAsDialog 
        isOpen={saveDialog !== null}
        pcName={pcName}
        defaultAppId={saveDialog?.defaultAppId || 'notepad'}
        existingFiles={files}
        onSave={(savedName) => {
          if (saveDialog?.callback) {
            saveDialog.callback(savedName);
          }
          setSaveDialog(null);
        }}
        onCancel={() => setSaveDialog(null)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog !== null}
        title={confirmDialog?.title || 'Notepad'}
        message={confirmDialog?.message || ''}
        onYes={confirmDialog?.onYes || (() => {})}
        onNo={confirmDialog?.onNo || (() => {})}
        onCancel={confirmDialog?.onCancel || (() => {})}
      />

      {/* End Session Confirmation Dialog */}
      {showEndSessionConfirm && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-[9999]">
          <div className="bg-white border-[3px] border-black shadow-none w-[320px] font-sans text-black flex flex-col">
            {/* Title Bar */}
            <div className="bg-[#0000aa] text-white font-bold text-sm px-2.5 py-1 flex items-center select-none border-b-2 border-black">
              End Session
            </div>
            {/* Content */}
            <div className="p-4 flex gap-4 items-center">
              {/* Warning exclamation triangle icon exactly matching Image 8 */}
              <div className="shrink-0">
                <svg width="42" height="42" viewBox="0 0 32 32" fill="none" shapeRendering="crispEdges">
                  {/* Yellow triangle */}
                  <polygon points="16,2 30,28 2,28" fill="#facc15" stroke="#000000" strokeWidth="2" />
                  {/* Black Exclamation point */}
                  <rect x="15" y="10" width="2" height="8" fill="#000000" />
                  <rect x="15" y="21" width="2" height="3" fill="#000000" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-900 leading-snug">
                This will end your Windows session.
              </div>
            </div>
            {/* Buttons */}
            <div className="p-3 border-t-2 border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button 
                className="border-[3px] border-black bg-white hover:bg-black hover:text-white px-5 py-1 text-xs font-bold uppercase cursor-pointer focus:outline-dashed focus:outline-1 focus:outline-offset-2 focus:outline-black"
                onClick={() => {
                  handleShutdown();
                  setShowEndSessionConfirm(false);
                }}
                autoFocus
              >
                OK
              </button>
              <button 
                className="border-[2px] border-black bg-white hover:bg-black hover:text-white px-4 py-1 text-xs font-bold uppercase cursor-pointer"
                onClick={() => setShowEndSessionConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
