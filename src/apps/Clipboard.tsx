import React, { useState, useEffect } from 'react';

export default function Clipboard() {
  const [clipboardText, setClipboardText] = useState('');

  const updateClipboard = () => {
    const text = localStorage.getItem('sigeon_clipboard') || '';
    setClipboardText(text);
  };

  useEffect(() => {
    updateClipboard();
    // Poll for changes so it updates in real-time
    const interval = setInterval(updateClipboard, 500);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    localStorage.removeItem('sigeon_clipboard');
    setClipboardText('');
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans select-none">
      <div className="flex gap-4 p-1 border-b-[3px] border-black bg-white shrink-0">
        <span 
          className="cursor-pointer hover:bg-black hover:text-white px-1 font-bold text-xs" 
          onClick={handleClear}
        >
          Clear
        </span>
      </div>
      <div className="flex-1 p-3 overflow-auto font-mono text-sm whitespace-pre-wrap">
        {clipboardText ? (
          clipboardText
        ) : (
          <span className="text-gray-500 italic">Clipboard is empty.</span>
        )}
      </div>
    </div>
  );
}
