import React, { useState, useEffect } from 'react';

interface CardItem {
  id: string;
  title: string;
  content: string;
}

export default function Cardfile() {
  const [cards, setCards] = useState<CardItem[]>(() => {
    const saved = localStorage.getItem('sigeon_cardfile_cards');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: '1', title: 'Welcome to Cardfile', content: 'Use the Card menu at the top to Add new cards, delete cards, or jump between cards.\n\nEverything you write here is fully persistent!' },
      { id: '2', title: 'Sigeon OS 2.0', content: 'Sigeon OS 2.0 now supports overlapping windows, dithered graphics, Calendar, Clipboard, Control Panel, and this Cardfile app.' }
    ];
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    localStorage.setItem('sigeon_cardfile_cards', JSON.stringify(cards));
  }, [cards]);

  const handleMenuClick = (menu: string) => {
    setMenuOpen(menuOpen === menu ? null : menu);
  };

  const closeMenu = () => setMenuOpen(null);

  const addCard = () => {
    const title = prompt('Enter Index Line (Title) for new card:');
    if (title) {
      const newCard: CardItem = {
        id: String(Date.now()),
        title: title.trim().toUpperCase(),
        content: ''
      };
      const updated = [...cards, newCard];
      setCards(updated);
      setActiveCardIndex(updated.length - 1);
    }
    closeMenu();
  };

  const deleteCard = () => {
    if (cards.length <= 1) {
      alert('You must keep at least one card.');
      return;
    }
    if (confirm('Delete the current card?')) {
      const updated = cards.filter((_, idx) => idx !== activeCardIndex);
      setCards(updated);
      setActiveCardIndex(Math.max(0, activeCardIndex - 1));
    }
    closeMenu();
  };

  const updateCardTitle = (newTitle: string) => {
    const updated = cards.map((c, idx) => {
      if (idx === activeCardIndex) {
        return { ...c, title: newTitle.toUpperCase() };
      }
      return c;
    });
    setCards(updated);
  };

  const updateCardContent = (newContent: string) => {
    const updated = cards.map((c, idx) => {
      if (idx === activeCardIndex) {
        return { ...c, content: newContent };
      }
      return c;
    });
    setCards(updated);
  };

  const nextCard = () => {
    setActiveCardIndex(prev => (prev + 1) % cards.length);
    closeMenu();
  };

  const prevCard = () => {
    setActiveCardIndex(prev => (prev - 1 + cards.length) % cards.length);
    closeMenu();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toUpperCase();
    const foundIndex = cards.findIndex(c => c.title.includes(query) || c.content.toUpperCase().includes(query));
    if (foundIndex !== -1) {
      setActiveCardIndex(foundIndex);
    } else {
      alert('No matching cards found.');
    }
    setShowSearch(false);
  };

  const currentCard = cards[activeCardIndex] || { title: 'UNTITLED', content: '' };

  return (
    <div className="flex flex-col h-full select-none bg-white font-sans" onPointerDown={() => closeMenu()}>
      {/* Cyan Menu Bar */}
      <div className="flex gap-4 p-1.5 border-b-[3px] border-black bg-[#00ffff] select-none text-black font-bold text-sm shrink-0 relative z-10">
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('file'); }}>File</span>
          {menuOpen === 'file' && (
            <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { setCards([{ id: '1', title: 'UNTITLED', content: '' }]); setActiveCardIndex(0); closeMenu(); }}>New</div>
            </div>
          )}
        </div>
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('edit'); }}>Edit</span>
          {menuOpen === 'edit' && (
            <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={() => { updateCardContent(''); closeMenu(); }}>Clear Body</div>
            </div>
          )}
        </div>
        <div className="relative">
          <span className="cursor-pointer hover:bg-black hover:text-white px-1" onPointerDown={(e) => { e.stopPropagation(); handleMenuClick('card'); }}>Card</span>
          {menuOpen === 'card' && (
            <div className="absolute top-full left-0 bg-white border-[3px] border-black flex flex-col z-50 whitespace-nowrap">
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={addCard}>Add...</div>
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={deleteCard}>Delete</div>
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={nextCard}>Next (Cycle)</div>
              <div className="px-4 py-1 hover:bg-black hover:text-white cursor-pointer" onClick={prevCard}>Previous</div>
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
      </div>

      {showSearch && (
        <form onSubmit={handleSearch} className="flex border-b-[3px] border-black p-1 gap-2 bg-gray-200 shrink-0">
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border-[2px] border-black px-1.5 py-0.5 outline-none text-sm bg-white"
            placeholder="Search Card Titles..."
            autoFocus
          />
          <button type="submit" className="border-2 border-black bg-gray-100 hover:bg-black hover:text-white px-2 py-0.5 text-xs font-bold">Find</button>
          <button type="button" className="border-2 border-black bg-gray-100 hover:bg-black hover:text-white px-2 py-0.5 text-xs font-bold" onClick={() => setShowSearch(false)}>Cancel</button>
        </form>
      )}

      {/* Blue Background Stage */}
      <div className="flex-1 bg-blue-700 relative p-4 flex items-center justify-center overflow-hidden">
        {/* Render stacked cards under the active one to look realistic */}
        {cards.slice(0, 3).map((_, i) => {
          const isCurrent = i === 0;
          const offset = i * 6;
          if (isCurrent) return null;
          return (
            <div 
              key={`stack-${i}`}
              className="absolute bg-gray-200 border-2 border-black rounded-sm shadow-sm"
              style={{
                width: 'min(90%, 360px)',
                height: '200px',
                transform: `translate(${offset}px, ${offset}px)`,
                zIndex: 10 - i,
                opacity: 0.5
              }}
            />
          );
        })}

        {/* Current Card */}
        <div 
          className="bg-white border-[3px] border-black flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] z-20 relative"
          style={{
            width: 'min(92%, 370px)',
            height: '215px',
          }}
        >
          {/* Index Header Line Area */}
          <div className="px-3 py-1.5 flex items-center bg-gray-50 shrink-0 select-none">
            <input 
              type="text"
              value={currentCard.title}
              onChange={(e) => updateCardTitle(e.target.value)}
              className="w-full bg-transparent font-bold text-sm tracking-wide text-black uppercase outline-none"
              placeholder="CARD INDEX (CLICK TO EDIT)"
            />
          </div>

          {/* Double Red line split exactly as shown in Image 4 */}
          <div className="border-b-[2px] border-red-500 h-[2px] border-t-[2px] shrink-0" />

          {/* Body content textarea */}
          <textarea
            value={currentCard.content}
            onChange={(e) => updateCardContent(e.target.value)}
            className="flex-1 p-3.5 outline-none resize-none font-mono text-sm leading-relaxed text-gray-900"
            placeholder="Type content on this card here..."
          />
        </div>

        {/* Page status label */}
        <div className="absolute bottom-1 right-2 text-xs font-bold text-white bg-blue-800 border border-white/30 px-2 py-0.5 rounded">
          Card {activeCardIndex + 1} of {cards.length}
        </div>
      </div>
    </div>
  );
}
