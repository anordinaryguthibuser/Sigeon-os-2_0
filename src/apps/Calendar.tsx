import React, { useState, useEffect } from 'react';

const HOURS = [
  '8:00 AM',
  '9:00',
  '10:00',
  '11:00',
  '12:00 PM',
  '1:00',
  '2:00',
  '3:00',
  '4:00'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(1987, 8, 9)); // Default to Wednesday, September 9, 1987 as in image!
  const [currentTimeStr, setCurrentTimeStr] = useState('3:32 AM');
  const [appointments, setAppointments] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  // Format current date: "Wednesday, September 9, 1987"
  const formatDateString = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // Load appointments from localStorage
  useEffect(() => {
    const key = getDateKey(currentDate);
    const savedAppts = localStorage.getItem(`sigeon_calendar_appts_${key}`);
    const savedNotes = localStorage.getItem(`sigeon_calendar_notes_${key}`) || '';
    
    if (savedAppts) {
      setAppointments(JSON.parse(savedAppts));
    } else {
      setAppointments({});
    }
    setNotes(savedNotes);
  }, [currentDate]);

  // Load current time clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // key 12 instead of 0
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes} ${ampm}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApptChange = (hour: string, value: string) => {
    const newAppts = { ...appointments, [hour]: value };
    setAppointments(newAppts);
    const key = getDateKey(currentDate);
    localStorage.setItem(`sigeon_calendar_appts_${key}`, JSON.stringify(newAppts));
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    const key = getDateKey(currentDate);
    localStorage.setItem(`sigeon_calendar_notes_${key}`, value);
  };

  const shiftDate = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + days);
    setCurrentDate(next);
  };

  return (
    <div 
      className="flex flex-col h-full select-none"
      style={{
        backgroundImage: 'conic-gradient(#ffffff 25%, #0055ff 25% 50%, #ffffff 50% 75%, #0055ff 75%)',
        backgroundSize: '4px 4px',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Cyan Menu Bar */}
      <div className="flex gap-4 p-1.5 border-b-[3px] border-black bg-[#00ffff] select-none text-black font-bold text-sm shrink-0">
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">File</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Edit</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">View</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Show</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Alarm</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Options</span>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-hidden">
        {/* Navigation / Header */}
        <div className="bg-white border-[3px] border-black flex items-center font-bold text-sm select-none p-1 shrink-0">
          <div className="px-3 py-1 bg-gray-100 border-r-2 border-black min-w-[90px] text-center shrink-0">
            {currentTimeStr}
          </div>
          <div className="flex border-r-2 border-black shrink-0">
            <button 
              className="px-2 py-1 hover:bg-black hover:text-white border-r border-black active:bg-gray-300 font-extrabold"
              onClick={() => shiftDate(-1)}
            >
              ◀
            </button>
            <button 
              className="px-2 py-1 hover:bg-black hover:text-white active:bg-gray-300 font-extrabold"
              onClick={() => shiftDate(1)}
            >
              ▶
            </button>
          </div>
          <div className="flex-1 px-3 text-left overflow-hidden text-ellipsis whitespace-nowrap">
            {formatDateString(currentDate)}
          </div>
        </div>

        {/* Schedule Grid Box */}
        <div className="flex-1 bg-white border-[3px] border-black flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto pr-1">
            {HOURS.map((hour) => (
              <div key={hour} className="flex border-b-2 border-gray-200 items-stretch min-h-[38px]">
                <div className="w-24 px-3 bg-gray-50 border-r-2 border-black text-right select-none font-bold text-xs flex items-center justify-end text-gray-700">
                  {hour}
                </div>
                <div className="flex-1 flex items-center bg-white px-1">
                  <input
                    type="text"
                    value={appointments[hour] || ''}
                    onChange={(e) => handleApptChange(hour, e.target.value)}
                    className="w-full bg-transparent px-2 py-1 text-sm outline-none border-none font-mono"
                    placeholder="..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Notes area */}
          <div className="border-t-[3px] border-black bg-gray-50 p-1 shrink-0">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="w-full h-16 resize-none bg-white border-2 border-black p-1.5 outline-none font-mono text-xs"
              placeholder="Notes for today..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
