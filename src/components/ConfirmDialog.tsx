import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onYes, onNo, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[10000] p-4 select-none">
      <div className="w-full max-w-sm bg-white border-[4px] border-black flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-sans">
        
        {/* Title Bar */}
        <div className="bg-[#0000aa] text-white px-3 py-1 border-b-[3px] border-black font-bold flex justify-between items-center text-sm">
          <span>{title}</span>
          <button 
            type="button"
            className="w-5 h-5 bg-white border-2 border-black text-black flex items-center justify-center text-xs font-bold active:bg-gray-300"
            onClick={onCancel}
          >
            X
          </button>
        </div>

        {/* Message and Buttons */}
        <div className="p-4 flex flex-col gap-5 bg-white">
          <div className="flex items-start gap-3">
            {/* Warning Question Icon */}
            <div className="w-10 h-10 border-[3px] border-black bg-[#55ff55] flex items-center justify-center text-xl font-bold shrink-0">
              ?
            </div>
            <div className="text-sm font-bold leading-relaxed pt-1 whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 text-xs font-bold">
            <button
              onClick={onYes}
              className="border-[3px] border-black bg-white hover:bg-black hover:text-white active:bg-gray-300 px-4 py-1.5 min-w-[70px]"
            >
              Yes
            </button>
            <button
              onClick={onNo}
              className="border-[3px] border-black bg-white hover:bg-black hover:text-white active:bg-gray-300 px-4 py-1.5 min-w-[70px]"
            >
              No
            </button>
            <button
              onClick={onCancel}
              className="border-[3px] border-black bg-gray-200 hover:bg-black hover:text-white active:bg-gray-400 px-4 py-1.5 min-w-[70px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
