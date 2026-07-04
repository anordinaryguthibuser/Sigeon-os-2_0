import React, { useState } from 'react';
import { FileItem } from '../types';

interface SaveAsDialogProps {
  isOpen: boolean;
  pcName: string;
  defaultAppId: 'notepad' | 'wordpad';
  existingFiles: FileItem[];
  onSave: (filename: string) => void;
  onCancel: () => void;
}

export default function SaveAsDialog({ isOpen, pcName, defaultAppId, existingFiles, onSave, onCancel }: SaveAsDialogProps) {
  const [fileName, setFileName] = useState('UNTITLED');
  const [fileType, setFileType] = useState<'TXT' | 'DOC'>(defaultAppId === 'wordpad' ? 'DOC' : 'TXT');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  if (!isOpen) return null;

  // Filter existing text and doc files to show in the simulated documents directory
  const documentFiles = existingFiles.filter(f => f.name.endsWith('.TXT') || f.name.endsWith('.DOC'));

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      alert("File name cannot be empty.");
      return;
    }

    // Format filename to uppercase and add correct extension
    let baseName = fileName.trim().toUpperCase();
    if (baseName.endsWith('.TXT')) baseName = baseName.slice(0, -4);
    if (baseName.endsWith('.DOC')) baseName = baseName.slice(0, -4);
    
    // Validate characters
    const sanitized = baseName.replace(/[^A-Z0-9_-]/g, '');
    if (!sanitized) {
      alert("Invalid file name characters.");
      return;
    }

    const finalName = `${sanitized}.${fileType}`;
    onSave(finalName);
  };

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4 select-none">
      <div className="w-full max-w-md bg-white border-[4px] border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-sans">
        
        {/* Dialog Title Bar */}
        <div className="bg-[#0000aa] text-white px-2 py-1.5 border-b-[3px] border-black flex justify-between items-center font-bold">
          <span>Save As</span>
          <button 
            type="button"
            className="w-5 h-5 bg-white border-2 border-black text-black flex items-center justify-center text-xs font-bold active:bg-gray-300"
            onClick={onCancel}
          >
            X
          </button>
        </div>

        {/* Path view resembling MS-PEX Executive but in DOCUMENTS folder */}
        <div className="bg-gray-100 p-2 border-b-2 border-black font-bold text-sm">
          {pcName}\C:\SIGEON\DOCUMENTS\
        </div>

        {/* Drive Info mimic */}
        <div className="p-1 px-2 flex gap-4 border-b-2 border-black items-center text-xs bg-white">
           <span className="font-bold opacity-50">A</span>
           <span className="font-bold border-[2px] border-black px-1">C</span>
           <span className="font-bold opacity-50">D</span>
        </div>

        <div className="p-3 flex flex-col gap-3 bg-white">
          
          {/* File list box */}
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">Existing Documents:</div>
          <div className="border-[3px] border-black h-28 overflow-y-auto p-1 bg-gray-50 flex flex-col">
            {documentFiles.length === 0 ? (
              <span className="text-gray-400 text-xs p-1 italic">No documents saved yet</span>
            ) : (
              documentFiles.map(f => (
                <div 
                  key={f.name}
                  className="cursor-pointer px-1 py-0.5 hover:bg-black hover:text-white text-xs font-mono flex justify-between"
                  onClick={() => {
                    // Extract base name without extension
                    const dotIndex = f.name.lastIndexOf('.');
                    const nameNoExt = dotIndex !== -1 ? f.name.substring(0, dotIndex) : f.name;
                    setFileName(nameNoExt);
                    const ext = f.name.substring(dotIndex + 1);
                    if (ext === 'DOC' || ext === 'TXT') {
                      setFileType(ext);
                    }
                  }}
                >
                  <span>{f.name}</span>
                  <span className="text-[10px] opacity-65">
                    {f.name.endsWith('.DOC') ? 'Wordpad' : 'Notepad'}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSaveClick} className="flex flex-col gap-3">
            {/* File Name Changer Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wide">File Name:</label>
              <div className="flex border-[3px] border-black">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="flex-1 px-2 py-1 outline-none text-sm font-mono bg-white uppercase"
                  autoFocus
                />
                <span className="bg-gray-100 px-2 py-1 font-mono text-sm border-l-2 border-black flex items-center">
                  .{fileType}
                </span>
              </div>
            </div>

            {/* File Type Dropdown */}
            <div className="flex flex-col gap-1 relative">
              <label className="text-xs font-bold uppercase tracking-wide">File Type:</label>
              <button
                type="button"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full border-[3px] border-black bg-gray-100 text-left px-3 py-1.5 text-xs font-bold flex justify-between items-center hover:bg-gray-200 active:bg-gray-300"
              >
                <span>{fileType === 'TXT' ? 'Text Document (*.TXT)' : 'Write Document (*.DOC)'}</span>
                <span className="text-[10px]">▼</span>
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full left-0 right-0 bg-white border-[3px] border-black z-50 flex flex-col shadow-md mt-1">
                  <div
                    className="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer text-xs font-bold"
                    onClick={() => {
                      setFileType('TXT');
                      setShowTypeDropdown(false);
                    }}
                  >
                    Text Document (*.TXT)
                  </div>
                  <div
                    className="px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer text-xs font-bold"
                    onClick={() => {
                      setFileType('DOC');
                      setShowTypeDropdown(false);
                    }}
                  >
                    Write Document (*.DOC)
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="border-[3px] border-black bg-gray-200 text-black px-4 py-1 text-xs font-bold hover:bg-black hover:text-white active:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="border-[3px] border-black bg-[#0000aa] text-white px-5 py-1 text-xs font-bold hover:bg-black hover:text-white active:bg-blue-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
