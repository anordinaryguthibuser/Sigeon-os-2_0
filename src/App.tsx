/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import SigeonOS from './SigeonOS';
import VirtualKeyboard from './VirtualKeyboard';

export default function App() {
  const [cursorPos, setCursorPos] = useState({ x: 200, y: 200 });
  const [isMobile, setIsMobile] = useState(false);
  const osRef = useRef<HTMLDivElement>(null);
  const trackpadRef = useRef<HTMLDivElement>(null);
  const lastTouch = useRef({ x: 0, y: 0 });
  
  const lastTapRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTrackpadStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastTouch.current = { x: clientX, y: clientY };
  };

  const handleTrackpadMove = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Prevent scrolling
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Calculate delta
    const dx = clientX - lastTouch.current.x;
    const dy = clientY - lastTouch.current.y;
    
    lastTouch.current = { x: clientX, y: clientY };
    
    setCursorPos(prev => {
      const osBounds = osRef.current?.getBoundingClientRect();
      if (!osBounds) return prev;
      
      let newX = prev.x + dx * 1.5; // Sensitivity
      let newY = prev.y + dy * 1.5;
      
      // Clamp
      newX = Math.max(0, Math.min(newX, osBounds.width));
      newY = Math.max(0, Math.min(newY, osBounds.height));
      
      return { x: newX, y: newY };
    });
  };
  
  const handleTrackpadTap = () => {
    if (!osRef.current) return;
    const osBounds = osRef.current.getBoundingClientRect();
    
    // Absolute position of cursor on screen
    const absoluteX = osBounds.left + cursorPos.x;
    const absoluteY = osBounds.top + cursorPos.y;
    
    // Temporarily hide our custom cursor so we don't click on it
    const cursorEl = document.getElementById('virtual-cursor');
    if (cursorEl) cursorEl.style.display = 'none';
    
    const target = document.elementFromPoint(absoluteX, absoluteY);
    
    if (cursorEl) cursorEl.style.display = 'block';

    if (target) {
      const now = Date.now();
      const isDblClick = now - lastTapRef.current < 500;
      lastTapRef.current = now;

      // Dispatch events to simulate click and pointer events
      target.dispatchEvent(new PointerEvent('pointerdown', {
        view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY, pointerId: 1
      }));
      target.dispatchEvent(new MouseEvent('mousedown', {
        view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY
      }));
      target.dispatchEvent(new PointerEvent('pointerup', {
        view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY, pointerId: 1
      }));
      target.dispatchEvent(new MouseEvent('mouseup', {
        view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY
      }));
      target.dispatchEvent(new MouseEvent('click', {
        view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY
      }));
      if (isDblClick) {
        target.dispatchEvent(new MouseEvent('dblclick', {
          view: window, bubbles: true, cancelable: true, clientX: absoluteX, clientY: absoluteY
        }));
      }

      // Give focus if it's an input
      if ((target as HTMLElement).focus) {
        (target as HTMLElement).focus();
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden touch-none font-sans">
      <div className={`bg-gray-800 sm:rounded-xl shadow-2xl sm:border-4 border-gray-700 flex flex-col overflow-hidden ${
        isMobile 
          ? 'w-full h-full justify-between' 
          : 'w-[min(100%,calc((100vh-2.5rem)*4/3))] max-h-[calc(100vh-2.5rem)] aspect-[4/3]'
      }`}>
        
        {/* Screen with 4:3 Aspect Ratio */}
        <div 
          ref={osRef}
          className={`bg-[#00ffff] relative overflow-hidden shrink-0 ${
            isMobile 
              ? 'w-full aspect-[4/3] max-h-[60vh] mx-auto' 
              : 'w-full h-full flex-1'
          }`}
        >
          <SigeonOS />
          
          {/* Virtual Cursor */}
          {isMobile && (
            <div 
              id="virtual-cursor"
              className="absolute z-[9999] pointer-events-none"
              style={{ 
                left: cursorPos.x, 
                top: cursorPos.y,
                transform: 'translate(-2px, -2px)'
              }}
            >
              {/* Simple arrow cursor */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M4 4L11.5 21L14 14L21 11.5L4 4Z" fill="black" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Keyboard / Controls area */}
        {isMobile && (
          <div className="h-[40vh] sm:h-64 bg-gray-900 border-t-4 border-gray-700 p-2 flex flex-col sm:flex-row gap-2 shrink-0">
             <div className="flex-[1.5] flex min-h-[140px]">
                <VirtualKeyboard />
             </div>
             
             <div 
               ref={trackpadRef}
               className="flex-1 min-h-[120px] bg-gray-800 rounded-lg border-2 border-gray-600 relative overflow-hidden flex flex-col items-center justify-center text-center text-sm text-gray-400 touch-none active:bg-gray-700 cursor-crosshair shadow-inner"
               onTouchStart={handleTrackpadStart}
               onTouchMove={handleTrackpadMove}
               onClick={handleTrackpadTap}
               onMouseDown={handleTrackpadStart}
               onMouseMove={(e) => { if (e.buttons === 1) handleTrackpadMove(e); }}
             >
               <div className="font-bold text-gray-400 mb-2">TRACKPAD</div>
               <div>Drag to move<br/>Tap to click</div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
