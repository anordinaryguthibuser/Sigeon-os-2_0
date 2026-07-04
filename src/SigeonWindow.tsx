import React, { useRef, useState, useEffect } from 'react';
import { WindowState, AppId } from './types';

interface WindowProps {
  key?: string | number;
  windowState: WindowState;
  isActive: boolean;
  bringToFront: () => void;
  closeWindow: () => void;
  updateWindow: (updates: Partial<WindowState>) => void;
  children: React.ReactNode;
}

export default function SigeonWindow({ windowState, isActive, bringToFront, closeWindow, updateWindow, children }: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPointer, setResizeStartPointer] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !windowState.isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        updateWindow({ isFullscreen: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, windowState.isFullscreen, updateWindow]);

  const handlePointerDown = (e: React.PointerEvent) => {
    bringToFront();
    // Stop propagation so OS doesn't clear active window
    e.stopPropagation();
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    bringToFront();
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      
      // Capture pointer so we keep dragging even if pointer leaves the title bar
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      // Find parent OS container bounds
      const parent = windowRef.current?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const windowWidth = windowState.width || 0;
      const windowHeight = windowState.height || 0;

      const maxDragX = Math.max(0, parentRect.width - windowWidth);
      const maxDragY = Math.max(0, parentRect.height - windowHeight);

      let newX = e.clientX - parentRect.left - dragOffset.x;
      let newY = e.clientY - parentRect.top - dragOffset.y;
      
      newX = Math.max(0, Math.min(newX, maxDragX));
      newY = Math.max(0, Math.min(newY, maxDragY));

      updateWindow({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    bringToFront();
    if (windowRef.current) {
      setResizeStartSize({
        width: windowState.width,
        height: windowState.height
      });
      setResizeStartPointer({
        x: e.clientX,
        y: e.clientY
      });
      setIsResizing(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (isResizing) {
      const parent = windowRef.current?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();

      const dx = e.clientX - resizeStartPointer.x;
      const dy = e.clientY - resizeStartPointer.y;

      const windowX = windowState.x || 0;
      const windowY = windowState.y || 0;

      const maxWidth = Math.max(160, parentRect.width - windowX);
      const maxHeight = Math.max(140, parentRect.height - windowY);

      let newWidth = Math.max(160, resizeStartSize.width + dx);
      let newHeight = Math.max(140, resizeStartSize.height + dy);

      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);

      updateWindow({ width: newWidth, height: newHeight });
    }
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  if (windowState.isMinimized) {
    return null; // Handle minimization in OS component
  }

  const isFS = windowState.isFullscreen;
  const borderClass = isFS ? "border-0" : (isActive ? "border-black" : "border-gray-800");
  
  const titleStyle: React.CSSProperties = {};
  const borderStyle: React.CSSProperties = {};

  if (isActive) {
    titleStyle.backgroundColor = windowState.themeColor || '#0000aa';
    if (windowState.themeColor) {
      borderStyle.borderColor = windowState.themeColor;
    }
  } else {
    titleStyle.backgroundColor = '#4b5563'; // gray-600
  }

  return (
    <div
      ref={windowRef}
      className={`absolute border-[3px] flex flex-col bg-white overflow-hidden shadow-none ${borderClass}`}
      style={{
        left: isFS ? 0 : windowState.x,
        top: isFS ? 0 : windowState.y,
        width: (isFS || windowState.isMaximized) ? '100%' : windowState.width,
        height: (isFS || windowState.isMaximized) ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
        ...borderStyle,
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Floating Exit Fullscreen Button */}
      {isFS && (
        <button 
          className="absolute top-2 right-2 bg-black text-white hover:bg-white hover:text-black border-2 border-white px-2 py-0.5 text-xs font-mono font-bold z-50 cursor-pointer active:scale-95 transition-all shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            updateWindow({ isFullscreen: false });
          }}
        >
          EXIT FULLSCREEN [ESC]
        </button>
      )}

      {/* Title Bar - hidden in Fullscreen */}
      {!isFS && (
        <div 
          className="flex justify-between items-center px-2 py-1 select-none text-white border-b-[3px] border-black touch-none"
          style={titleStyle}
          onPointerDown={handleTitlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex items-center">
            {/* System Menu Icon (Hamburger-like) */}
            <div 
              className="w-5 h-5 bg-white flex flex-col justify-evenly p-0.5 border-2 border-black mr-2 cursor-pointer active:bg-gray-300"
              onClick={closeWindow}
              title="Double click to close (simulated by click here for now)"
            >
              <div className="w-full h-0.5 bg-black"></div>
              <div className="w-full h-0.5 bg-black"></div>
              <div className="w-full h-0.5 bg-black"></div>
            </div>
            <span className="font-bold tracking-widest text-lg">{windowState.title}</span>
          </div>
          
          {/* Min/Max/Close could go here, Win 1.0 had sizing boxes on the right */}
          <div className="flex gap-1">
            <div 
              className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center cursor-pointer font-bold text-black active:bg-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                updateWindow({ isMaximized: !windowState.isMaximized, x: 0, y: 0 });
              }}
              title={windowState.isMaximized ? "Restore window" : "Maximize window"}
            >
              <div className="w-3 h-3 border border-black flex items-start justify-end p-0.5"><div className="w-1.5 h-1.5 bg-black"></div></div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar - renders under title bar if tabs are defined */}
      {!isFS && windowState.tabs && windowState.tabs.length > 0 && (
        <div className="flex bg-[#e1e1e1] border-b-[3px] border-black select-none overflow-x-auto scrollbar-none">
          {windowState.tabs.map((tab) => {
            const isTabActive = windowState.activeTabId === tab.id;
            return (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-1.5 border-r-2 border-black font-bold text-xs cursor-pointer ${
                  isTabActive 
                    ? 'bg-white text-black border-b-[3px] border-white -mb-[3px]' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  updateWindow({ activeTabId: tab.id });
                }}
              >
                <span>{tab.title}</span>
                {windowState.tabs!.length > 1 && (
                  <button
                    className="hover:bg-red-500 hover:text-white rounded px-1 ml-1 font-bold text-[10px] border border-transparent hover:border-black cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const remainingTabs = windowState.tabs!.filter(t => t.id !== tab.id);
                      let newActiveTabId = windowState.activeTabId;
                      if (newActiveTabId === tab.id && remainingTabs.length > 0) {
                        newActiveTabId = remainingTabs[0].id;
                      }
                      
                      if (remainingTabs.length === 0) {
                        closeWindow();
                      } else {
                        updateWindow({
                          tabs: remainingTabs,
                          activeTabId: newActiveTabId
                        });
                      }
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {/* Quick tab addition plus icon */}
          <button
            className="px-3 py-1 hover:bg-gray-200 text-black font-bold text-sm cursor-pointer border-r-2 border-black active:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              const newTabId = `tab-${Date.now()}`;
              const newTab = {
                id: newTabId,
                appId: 'terminal' as AppId,
                title: 'Terminal'
              };
              updateWindow({
                tabs: [...(windowState.tabs || []), newTab],
                activeTabId: newTabId
              });
            }}
            title="Open new Terminal tab"
          >
            +
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 bg-white relative overflow-auto text-black">
        {children}
      </div>

      {/* Resize Handle */}
      {!isFS && !windowState.isMaximized && (
        <div 
          className="absolute right-0 bottom-0 w-5 h-5 bg-gray-200 border-l-[2px] border-t-[2px] border-black cursor-se-resize z-50 flex items-center justify-center select-none active:bg-gray-400 touch-none"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.5" className="opacity-70 pointer-events-none">
            <line x1="10" y1="2" x2="2" y2="10" />
            <line x1="10" y1="5" x2="5" y2="10" />
            <line x1="10" y1="8" x2="8" y2="10" />
          </svg>
        </div>
      )}
    </div>
  );
}
