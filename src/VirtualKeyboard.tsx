import React from 'react';

const row1 = ['Q','W','E','R','T','Y','U','I','O','P'];
const row2 = ['A','S','D','F','G','H','J','K','L'];
const row3 = ['Z','X','C','V','B','N','M'];

export default function VirtualKeyboard() {
  const pressKey = (key: string) => {
    // A simple hack to dispatch a keyboard event or just rely on native focus
    // Real virtual keyboards that inject into arbitrary inputs are complex in React
    // For now, we dispatch a generic keydown to the active element
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
       // Since React uses synthetic events, direct dispatchEvent might not update React state
       // However, we can try to use execCommand to insert text
       if (key === 'Backspace') {
          document.execCommand('delete', false);
       } else if (key === 'Enter') {
          // Hard to simulate enter in React reliably without knowing the component
          active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
       } else if (key === 'Space') {
          document.execCommand('insertText', false, ' ');
       } else {
          document.execCommand('insertText', false, key);
       }
    }
  };

  const btnClass = "bg-gray-700 active:bg-gray-500 rounded text-white font-bold flex items-center justify-center p-1 sm:p-2 cursor-pointer shadow-sm border border-gray-900";

  return (
    <div className="flex flex-col gap-1 w-full h-full p-1 bg-gray-800 rounded select-none">
      <div className="flex justify-center gap-1">
        {row1.map(k => <div key={k} className={`${btnClass} flex-1 max-w-10`} onClick={() => pressKey(k)}>{k}</div>)}
      </div>
      <div className="flex justify-center gap-1 px-4">
        {row2.map(k => <div key={k} className={`${btnClass} flex-1 max-w-10`} onClick={() => pressKey(k)}>{k}</div>)}
      </div>
      <div className="flex justify-center gap-1 px-8">
        {row3.map(k => <div key={k} className={`${btnClass} flex-1 max-w-10`} onClick={() => pressKey(k)}>{k}</div>)}
        <div className={`${btnClass} px-2 text-xs`} onClick={() => pressKey('Backspace')}>DEL</div>
      </div>
      <div className="flex justify-center gap-1 px-12 mt-1">
        <div className={`${btnClass} flex-1 max-w-40`} onClick={() => pressKey('Space')}>SPACE</div>
        <div className={`${btnClass} px-4 text-xs`} onClick={() => pressKey('Enter')}>RET</div>
      </div>
    </div>
  );
}
