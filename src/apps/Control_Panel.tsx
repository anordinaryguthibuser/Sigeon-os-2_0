import React, { useState, useEffect } from 'react';

interface ControlPanelProps {
  pcName: string;
  setPcName: (name: string) => void;
}

export default function ControlPanel({ pcName, setPcName }: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'preferences' | 'setup'>('preferences');
  const [tempName, setTempName] = useState(pcName);

  // Time & Date State
  const [timeStr, setTimeStr] = useState('12:00:00 AM');
  const [dateStr, setDateStr] = useState('9/09/87');

  // Interactive controls
  const [cursorBlinkVal, setCursorBlinkVal] = useState(50); // 0 (slow) to 100 (fast)
  const [doubleClickVal, setDoubleClickVal] = useState(50);

  // Blinking cursor state
  const [cursorVisible, setCursorVisible] = useState(true);

  // Double click test state
  const [testFlash, setTestFlash] = useState(false);
  const [testText, setTestText] = useState('TEST');
  const [lastClickTime, setLastClickTime] = useState(0);

  // Ticking Time & Date
  useEffect(() => {
    const updateTimeDate = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true }));
      
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const yy = String(now.getFullYear()).slice(-2);
      setDateStr(`${mm}/${dd}/${yy}`);
    };
    updateTimeDate();
    const interval = setInterval(updateTimeDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cursor Blink Timer
  useEffect(() => {
    // slow = 1500ms, fast = 150ms
    const speedMs = 1500 - (cursorBlinkVal / 100) * 1350;
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, speedMs);
    return () => clearInterval(interval);
  }, [cursorBlinkVal]);

  const handleApplyPCName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setPcName(tempName.trim());
      alert("Settings saved successfully.");
    } else {
      alert("PC Name cannot be empty.");
    }
  };

  // Test double click speed based on doubleClickVal slider
  const handleTestClick = () => {
    const now = Date.now();
    // slow double-click threshold = 1200ms, fast threshold = 200ms
    const thresholdMs = 1200 - (doubleClickVal / 100) * 1000;
    const diff = now - lastClickTime;

    if (diff < thresholdMs && diff > 50) {
      setTestFlash(true);
      setTestText('SUCCESS!');
      setTimeout(() => {
        setTestFlash(false);
        setTestText('TEST');
      }, 800);
    }
    setLastClickTime(now);
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans select-none">
      {/* Menu Bar with cyan background */}
      <div className="flex gap-4 p-1.5 border-b-[3px] border-black bg-[#00ffff] text-black font-bold text-sm shrink-0">
        <span 
          className={`cursor-pointer px-1 ${activeTab === 'preferences' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </span>
        <span 
          className={`cursor-pointer px-1 ${activeTab === 'setup' ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
          onClick={() => setActiveTab('setup')}
        >
          Setup
        </span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Installation</span>
      </div>

      {activeTab === 'preferences' ? (
        <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-auto bg-white">
          
          {/* Time frame box */}
          <div className="border-[3px] border-black relative p-4 pt-6 mt-1 flex items-center justify-center bg-white">
            <span className="absolute -top-3 left-4 bg-white px-1.5 text-xs font-bold uppercase tracking-wider">Time</span>
            <div className="text-xl font-bold tracking-wider font-mono">{timeStr}</div>
          </div>

          {/* Date frame box */}
          <div className="border-[3px] border-black relative p-4 pt-6 mt-1 flex items-center justify-center bg-white">
            <span className="absolute -top-3 left-4 bg-white px-1.5 text-xs font-bold uppercase tracking-wider">Date</span>
            <div className="text-xl font-bold tracking-wider font-mono">{dateStr}</div>
          </div>

          {/* Cursor Blink frame box */}
          <div className="border-[3px] border-black relative p-4 pt-6 mt-1 flex flex-col items-center justify-between bg-white min-h-[130px]">
            <span className="absolute -top-3 left-4 bg-white px-1.5 text-xs font-bold uppercase tracking-wider">Cursor Blink</span>
            
            {/* Slider with slow / fast labels */}
            <div className="w-full flex flex-col items-center gap-1.5">
              <div className="w-full flex justify-between text-[11px] font-bold px-1 text-gray-700">
                <span>Slow</span>
                <span>Fast</span>
              </div>
              <div className="w-full flex items-center">
                <button 
                  className="border-[2px] border-black px-1 py-0.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => setCursorBlinkVal(v => Math.max(0, v - 10))}
                >
                  ◀
                </button>
                <div 
                  className="flex-1 h-5 mx-0.5 border-y-[2px] border-black relative flex items-center"
                  style={{
                    backgroundImage: 'conic-gradient(#ffffff 25%, #888888 25% 50%, #ffffff 50% 75%, #888888 75%)',
                    backgroundSize: '4px 4px'
                  }}
                >
                  <div 
                    className="w-5 h-full border-[2px] border-black bg-white cursor-pointer absolute"
                    style={{ left: `calc(${cursorBlinkVal}% - ${cursorBlinkVal/100 * 20}px)` }}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={cursorBlinkVal} 
                    onChange={e => setCursorBlinkVal(Number(e.target.value))}
                    className="w-full h-full opacity-0 absolute cursor-pointer"
                  />
                </div>
                <button 
                  className="border-[2px] border-black px-1 py-0.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => setCursorBlinkVal(v => Math.min(100, v + 10))}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Blinking indicator line */}
            <div className="h-6 flex items-center justify-center font-bold text-lg">
              {cursorVisible ? '|' : '\u00A0'}
            </div>
          </div>

          {/* Double Click Speed frame box */}
          <div className="border-[3px] border-black relative p-4 pt-6 mt-1 flex flex-col items-center justify-between bg-white min-h-[130px]">
            <span className="absolute -top-3 left-4 bg-white px-1.5 text-xs font-bold uppercase tracking-wider">Double Click</span>
            
            <div className="w-full flex flex-col items-center gap-1.5">
              <div className="w-full flex justify-between text-[11px] font-bold px-1 text-gray-700">
                <span>Slow</span>
                <span>Fast</span>
              </div>
              <div className="w-full flex items-center">
                <button 
                  className="border-[2px] border-black px-1 py-0.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => setDoubleClickVal(v => Math.max(0, v - 10))}
                >
                  ◀
                </button>
                <div 
                  className="flex-1 h-5 mx-0.5 border-y-[2px] border-black relative flex items-center"
                  style={{
                    backgroundImage: 'conic-gradient(#ffffff 25%, #888888 25% 50%, #ffffff 50% 75%, #888888 75%)',
                    backgroundSize: '4px 4px'
                  }}
                >
                  <div 
                    className="w-5 h-full border-[2px] border-black bg-white cursor-pointer absolute"
                    style={{ left: `calc(${doubleClickVal}% - ${doubleClickVal/100 * 20}px)` }}
                  />
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={doubleClickVal} 
                    onChange={e => setDoubleClickVal(Number(e.target.value))}
                    className="w-full h-full opacity-0 absolute cursor-pointer"
                  />
                </div>
                <button 
                  className="border-[2px] border-black px-1 py-0.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                  onClick={() => setDoubleClickVal(v => Math.min(100, v + 10))}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* TEST Button */}
            <button 
              className={`border-[3px] border-black px-6 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                testFlash 
                  ? 'bg-black text-white' 
                  : 'bg-white hover:bg-black hover:text-white active:bg-gray-300'
              }`}
              onClick={handleTestClick}
            >
              {testText}
            </button>
          </div>

        </div>
      ) : (
        <form onSubmit={handleApplyPCName} className="flex-1 p-4 flex flex-col gap-5 max-w-sm overflow-auto">
          {/* Computer Rename Section */}
          <div className="border-[3px] border-black p-3.5 bg-gray-50 relative mt-2 pt-5">
            <span className="absolute -top-3 left-4 bg-white px-1 text-xs font-bold uppercase">Computer Name</span>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              maxLength={15}
              className="w-full border-2 border-black bg-white text-black px-2 py-1 outline-none font-mono focus:bg-gray-100"
            />
            <p className="text-[10px] text-gray-500 mt-1.5">Maximum 15 characters.</p>
          </div>

          {/* System Version info Section */}
          <div className="border-[3px] border-black p-3.5 bg-gray-50 relative mt-2 pt-5">
            <span className="absolute -top-3 left-4 bg-white px-1 text-xs font-bold uppercase">System Information</span>
            <div className="text-xs flex flex-col gap-1.5 font-mono mt-1 text-gray-800">
              <div><span className="font-sans font-bold">OS:</span> Sigeon OS 2.0</div>
              <div><span className="font-sans font-bold">Build:</span> MS-PEX-200</div>
              <div><span className="font-sans font-bold">Storage:</span> LOCAL_FS (30 files max)</div>
              <div><span className="font-sans font-bold">Memory:</span> 1MB RAM (Upgraded!)</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="self-start border-[3px] border-black bg-gray-200 text-black px-5 py-1.5 font-bold hover:bg-black hover:text-white active:bg-gray-400 text-xs"
          >
            Apply Changes
          </button>
        </form>
      )}
    </div>
  );
}
