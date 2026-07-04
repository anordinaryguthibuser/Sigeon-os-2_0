import React, { useState, useRef, useEffect } from 'react';
import { AppId, FileItem } from '../types';

interface MSpexProps {
  files: FileItem[];
  openFile: (file: FileItem) => void;
  deleteFile: (fileName: string) => void;
  onShutdown: () => void;
  onRestart: () => void;
  pcName: string;
}

export default function MSpexExecutive({ files, openFile, deleteFile, onShutdown, onRestart, pcName }: MSpexProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'short' | 'long'>('short');

  const handleMenuClick = (menu: string) => {
    setMenuOpen(menuOpen === menu ? null : menu);
  };

  const closeMenu = () => setMenuOpen(null);

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans" onPointerDown={() => closeMenu()}>
      {/* Menu bar */}
      <div className="flex gap-4 p-1 border-b-[3px] border-black bg-[#00ffff] select-none relative">
        <div className="relative">
           <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('file'); }}>File</span>
           {menuOpen === 'file' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black shadow-none flex flex-col z-50">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => {
                   if (selectedFile) {
                      const file = files.find(f => f.name === selectedFile);
                      if (file) openFile(file);
                   }
                   closeMenu();
                }}>Open</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => {
                   if (selectedFile) deleteFile(selectedFile);
                   closeMenu();
                }}>Delete</div>
             </div>
           )}
        </div>
        <div className="relative">
           <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('view'); }}>View</span>
           {menuOpen === 'view' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black shadow-none flex flex-col z-50 whitespace-nowrap">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { setViewMode('short'); closeMenu(); }}>{viewMode === 'short' && '• '}Short</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { setViewMode('long'); closeMenu(); }}>{viewMode === 'long' && '• '}Long</div>
             </div>
           )}
        </div>
        <div className="relative">
           <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('special'); }}>Special</span>
           {menuOpen === 'special' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black shadow-none flex flex-col z-50 whitespace-nowrap">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { closeMenu(); onRestart(); }}>Restart</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { closeMenu(); onShutdown(); }}>End Session</div>
             </div>
           )}
        </div>
      </div>
      
      {/* Disk info */}
      <div className="p-2 flex gap-4 border-b-[3px] border-black items-center">
         <span className="font-bold">A</span>
         <span className="font-bold border-2 border-black px-1 pb-1">C</span>
         <span className="font-bold">D</span>
      </div>
      
      <div className="p-2 border-b-[3px] border-black font-bold">
        {pcName}\C:\SIGEON\
      </div>

      {/* File list */}
      <div className={`p-4 overflow-auto ${viewMode === 'short' ? 'grid grid-cols-2 gap-x-8 gap-y-1' : 'flex flex-col gap-1'}`}>
        {files.map(f => (
          <div 
            key={f.name} 
            className={`cursor-pointer px-1 flex justify-between ${selectedFile === f.name ? 'bg-black text-white' : 'hover:bg-black hover:text-white'}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedFile(f.name);
            }}
            onDoubleClick={() => openFile(f)}
          >
            <span>{f.name}</span>
            {viewMode === 'long' && (
              <span className="text-gray-500 text-sm">
                {f.isSystem ? 'System File' : 'Document'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
