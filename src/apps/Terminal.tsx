import React, { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  pcName: string;
  triggerBsod?: () => void;
  windowId?: string;
  tabId?: string;
  executeOSCommand?: (cmdStr: string) => string;
}

export default function Terminal({ pcName, triggerBsod, windowId, tabId, executeOSCommand }: TerminalProps) {
  const prompt = `${pcName}\\C:\\SIGEON>`;
  const [history, setHistory] = useState<string[]>(['MS-PEX Executive Shell v2.00', 'Copyright (C) Sigeon Corp.', 'Type "HELP" or "wt help" for list of commands.', '']);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newHistory = [...history, `${prompt}${input}`];
      
      const cmd = input.trim();
      const cmdLower = cmd.toLowerCase();
      const firstWord = cmdLower.split(/\s+/)[0];

      if (firstWord === 'wt' && executeOSCommand) {
        const response = executeOSCommand(cmd);
        if (response) {
          newHistory.push(response);
        }
      } else if (cmdLower === 'dir') {
        newHistory.push('CALC.PEX  PAINT.PEX  NOTEPAD.PEX  WRITE.PEX  TERMINAL.PEX  EXPLORER.PEX  CLOCK.PEX');
      } else if (cmdLower === 'ver') {
        newHistory.push('Sigeon OS Version 2.00 (with Multi-Tab and Window Shell)');
      } else if (cmdLower === 'help') {
        newHistory.push('Available commands: DIR, VER, CLS, HELP, CRASH, WT');
        newHistory.push('Type "wt help" to see the Window and Tab Manager commands.');
      } else if (cmdLower === 'crash') {
        if (triggerBsod) triggerBsod();
        return;
      } else if (cmdLower === 'cls') {
        setHistory([]);
        setInput('');
        return;
      } else if (cmd !== '') {
        newHistory.push(`Bad command or file name`);
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-black text-white p-2 overflow-auto" onClick={(e) => {
      // Focus input when clicking anywhere in terminal
      const inputEl = e.currentTarget.querySelector('input');
      if (inputEl) inputEl.focus();
    }}>
      {history.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">{line}</div>
      ))}
      <div className="flex">
        <span className="mr-2">{prompt}</span>
        <input 
          type="text" 
          className="flex-1 bg-transparent outline-none border-none text-white font-mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
