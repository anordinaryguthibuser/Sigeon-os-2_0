import React, { useState, useRef } from 'react';

interface NotepadProps {
  isWordpad?: boolean;
  content?: string;
  filename?: string;
  saveFile?: (filename: string, content: string) => void;
  onChange?: (text: string) => void;
  onRequestSaveAs?: (currentText: string, defaultExt: string, callback: (savedFilename: string) => void) => void;
}

export default function Notepad({ isWordpad, content = '', filename = '', saveFile, onChange, onRequestSaveAs }: NotepadProps) {
  const [text, setText] = useState(content);
  const [currentFile, setCurrentFile] = useState(filename || (isWordpad ? 'DOCUMENT.DOC' : 'UNTITLED.TXT'));
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setText(content);
  }, [content]);

  React.useEffect(() => {
    setCurrentFile(filename || (isWordpad ? 'DOCUMENT.DOC' : 'UNTITLED.TXT'));
  }, [filename, isWordpad]);

  const updateText = (newText: string) => {
    setText(newText);
    if (onChange) {
      onChange(newText);
    }
  };

  const handleMenuClick = (menu: string) => {
    setMenuOpen(menuOpen === menu ? null : menu);
  };

  const closeMenu = () => setMenuOpen(null);

  const handleSave = () => {
    let name = currentFile;
    if (name === 'UNTITLED.TXT' || name === 'DOCUMENT.DOC') {
      if (onRequestSaveAs) {
        onRequestSaveAs(text, isWordpad ? 'DOC' : 'TXT', (savedName) => {
          setCurrentFile(savedName);
        });
      } else {
        const ext = isWordpad ? '.DOC' : '.TXT';
        const promptName = prompt(`Enter file name (ending in ${ext}):`, name);
        if (promptName) {
           name = promptName.toUpperCase();
           if (!name.endsWith(ext)) name += ext;
           setCurrentFile(name);
           if (saveFile) saveFile(name, text);
        }
      }
    } else {
      if (saveFile) saveFile(name, text);
    }
    closeMenu();
  };

  const handleCopy = () => {
    const el = textareaRef.current;
    if (el) {
      const selected = el.value.substring(el.selectionStart, el.selectionEnd);
      if (selected) {
        localStorage.setItem('sigeon_clipboard', selected);
      }
    }
    closeMenu();
  };

  const handleCut = () => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = el.value.substring(start, end);
      if (selected) {
        localStorage.setItem('sigeon_clipboard', selected);
        const newText = text.substring(0, start) + text.substring(end);
        updateText(newText);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = start;
          el.focus();
        }, 0);
      }
    }
    closeMenu();
  };

  const handlePaste = () => {
    const clip = localStorage.getItem('sigeon_clipboard') || '';
    insertText(clip);
    closeMenu();
  };

  const insertText = (str: string) => {
    const el = textareaRef.current;
    if (el) {
       const start = el.selectionStart;
       const end = el.selectionEnd;
       const newText = text.substring(0, start) + str + text.substring(end);
       updateText(newText);
       setTimeout(() => {
          el.selectionStart = el.selectionEnd = start + str.length;
          el.focus();
       }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative" onPointerDown={() => closeMenu()}>
      <div className="flex gap-4 p-1 border-b-[3px] border-black bg-[#00ffff] select-none shrink-0 relative z-10">
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('file'); }}>File</span>
          {menuOpen === 'file' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { updateText(''); setCurrentFile(isWordpad ? 'DOCUMENT.DOC' : 'UNTITLED.TXT'); closeMenu(); }}>New</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={handleSave}>Save</div>
             </div>
          )}
        </div>
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('edit'); }}>Edit</span>
          {menuOpen === 'edit' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={handleCut}>Cut</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={handleCopy}>Copy</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={handlePaste}>Paste</div>
                <div className="px-4 py-1 border-t-2 border-black/10 hover:bg-black hover:text-white cursor-pointer" onClick={() => { updateText(''); closeMenu(); }}>Clear All</div>
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { insertText(new Date().toLocaleString()); closeMenu(); }}>Time/Date</div>
             </div>
          )}
        </div>
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('search'); }}>Search</span>
          {menuOpen === 'search' && (
             <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
                <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { setShowSearch(!showSearch); closeMenu(); }}>Find...</div>
             </div>
          )}
        </div>
        {isWordpad && (
          <div className="relative">
            <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('character'); }}>Character</span>
            {menuOpen === 'character' && (
               <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
                  <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { insertText('★'); closeMenu(); }}>Insert Star</div>
                  <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { insertText('©'); closeMenu(); }}>Insert Copyright</div>
               </div>
            )}
          </div>
        )}
        {isWordpad && (
          <div className="relative">
            <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('paragraph'); }}>Paragraph</span>
            {menuOpen === 'paragraph' && (
               <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
                  <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { insertText('\n\n    '); closeMenu(); }}>Indent Block</div>
               </div>
            )}
          </div>
        )}
      </div>
      
      {showSearch && (
        <div className="flex border-b-[3px] border-black p-1 gap-2 bg-gray-200 shrink-0">
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border-[2px] border-black px-1 outline-none"
            placeholder="Find text..."
          />
          <button 
            className="border-[2px] border-black bg-white px-2 font-bold active:bg-gray-300"
            onClick={() => {
              if (!searchQuery) return;
              const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase(), textareaRef.current?.selectionEnd || 0);
              if (idx !== -1 && textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(idx, idx + searchQuery.length);
              } else {
                alert("Cannot find '" + searchQuery + "'");
              }
            }}
          >
            Find Next
          </button>
          <button className="font-bold px-2 hover:bg-black hover:text-white" onClick={() => setShowSearch(false)}>X</button>
        </div>
      )}

      <textarea 
        ref={textareaRef}
        className="flex-1 w-full p-2 outline-none resize-none"
        value={text}
        onChange={(e) => updateText(e.target.value)}
        spellCheck={false}
        placeholder={isWordpad ? "Write your document..." : ""}
        style={{
           fontFamily: isWordpad ? 'serif' : 'inherit',
           fontSize: isWordpad ? '1.2rem' : '1rem'
        }}
      />
    </div>
  );
}
