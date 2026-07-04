import React, { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetOnNextInput, setResetOnNextInput] = useState(false);

  const handlePress = (btn: string) => {
    // Basic numbers and decimal point
    if (!isNaN(Number(btn)) || btn === '.') {
      if (resetOnNextInput || display === '0' || display === 'Error') {
        setDisplay(btn === '.' ? '0.' : btn);
        setResetOnNextInput(false);
      } else {
        if (btn === '.' && display.includes('.')) return;
        setDisplay(display + btn);
      }
      return;
    }

    // Plus/Minus ±
    if (btn === '±') {
      if (display === '0' || display === 'Error') return;
      if (display.startsWith('-')) {
        setDisplay(display.slice(1));
      } else {
        setDisplay('-' + display);
      }
      return;
    }

    // Clear C
    if (btn === 'C') {
      setDisplay('0');
      setPrevVal(null);
      setOperation(null);
      setResetOnNextInput(false);
      return;
    }

    // Square Root √
    if (btn === '√') {
      const val = Number(display);
      if (isNaN(val) || val < 0) {
        setDisplay('Error');
      } else {
        setDisplay(String(Math.sqrt(val)));
      }
      setResetOnNextInput(true);
      return;
    }

    // Percentage %
    if (btn === '%') {
      const val = Number(display);
      if (isNaN(val)) {
        setDisplay('Error');
      } else {
        setDisplay(String(val / 100));
      }
      setResetOnNextInput(true);
      return;
    }

    // Memory operations
    if (btn === 'MC') {
      setMemory(0);
      return;
    }
    if (btn === 'MR') {
      setDisplay(String(memory));
      setResetOnNextInput(true);
      return;
    }
    if (btn === 'M+') {
      const val = Number(display);
      if (!isNaN(val)) setMemory(m => m + val);
      setResetOnNextInput(true);
      return;
    }
    if (btn === 'M-') {
      const val = Number(display);
      if (!isNaN(val)) setMemory(m => m - val);
      setResetOnNextInput(true);
      return;
    }

    // Mathematical Operators
    if (['+', '-', '*', '/'].includes(btn)) {
      const val = Number(display);
      if (isNaN(val)) {
        setDisplay('Error');
        return;
      }
      if (prevVal !== null && operation) {
        const result = calculate(prevVal, val, operation);
        setDisplay(String(result));
        setPrevVal(result);
      } else {
        setPrevVal(val);
      }
      setOperation(btn);
      setResetOnNextInput(true);
      return;
    }

    // Equals =
    if (btn === '=') {
      const val = Number(display);
      if (isNaN(val) || prevVal === null || !operation) return;
      const result = calculate(prevVal, val, operation);
      setDisplay(String(result));
      setPrevVal(null);
      setOperation(null);
      setResetOnNextInput(true);
    }
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  // Row by row button list as per 2nd image.png grid layout:
  // MC, 7, 8, 9, /, √
  // MR, 4, 5, 6, *, %
  // M+, 1, 2, 3, -, C
  // M-, 0, ., ±, +, =
  const buttons = [
    'MC', '7', '8', '9', '/', '√',
    'MR', '4', '5', '6', '*', '%',
    'M+', '1', '2', '3', '-', 'C',
    'M-', '0', '.', '±', '+', '='
  ];

  return (
    <div 
      className="flex flex-col h-full select-none"
      style={{
        backgroundImage: 'conic-gradient(#ffffff 25%, #4b5efd 25% 50%, #ffffff 50% 75%, #4b5efd 75%)',
        backgroundSize: '4px 4px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Menu bar with cyan background */}
      <div className="flex gap-4 p-1.5 border-b-[3px] border-black bg-[#00ffff] select-none text-black font-bold text-sm shrink-0">
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Edit</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">View</span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Display screen styled as a pill shape inside of the dither canvas */}
        <div className="border-[3px] border-black px-4 py-2 text-right text-2xl font-bold bg-white text-black rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] shrink-0 min-h-[46px]">
          {display}
        </div>

        {/* Buttons grid */}
        <div className="grid grid-cols-6 gap-2 flex-1">
          {buttons.map(b => {
            const isMemory = b.startsWith('M');
            const isClear = b === 'C';
            const isEquals = b === '=';
            
            // Retro colors or outlines
            let buttonStyle = "bg-white text-black hover:bg-black hover:text-white";
            if (isMemory) {
              buttonStyle = "bg-[#f3f4f6] text-[#0000aa] hover:bg-black hover:text-white";
            } else if (isClear) {
              buttonStyle = "bg-[#fee2e2] text-red-700 hover:bg-red-700 hover:text-white";
            } else if (isEquals) {
              buttonStyle = "bg-[#00ffff] text-black hover:bg-black hover:text-white";
            }

            return (
              <button 
                key={b}
                className={`border-[3px] border-black rounded-full font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center p-1 cursor-pointer min-h-[36px] ${buttonStyle}`}
                onClick={() => handlePress(b)}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
