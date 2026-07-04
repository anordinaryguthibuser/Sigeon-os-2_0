import React, { useRef, useState, useEffect } from 'react';

export default function Paint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000'); // only black and white

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    const x = Math.floor(clientX - rect.left);
    const y = Math.floor(clientY - rect.top);

    ctx.fillStyle = color;
    // blocky pixel brush
    ctx.fillRect(x - 2, y - 2, 4, 4);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex gap-4 p-1 border-b-[3px] border-black bg-white select-none">
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">File</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Edit</span>
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Font</span>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbox */}
        <div className="w-12 border-r-[3px] border-black flex flex-col items-center py-2 gap-2">
           <button 
             className={`w-8 h-8 border-2 border-black ${color === '#000000' ? 'bg-black' : 'bg-white'}`}
             onClick={() => setColor('#000000')}
             title="Black"
           />
           <button 
             className={`w-8 h-8 border-2 border-black relative ${color === '#ffffff' ? 'ring-2 ring-blue-500' : ''}`}
             onClick={() => setColor('#ffffff')}
             title="White (Eraser)"
           >
             <div className="absolute inset-0 bg-white"></div>
           </button>
           <button className="w-8 h-8 border-2 border-black flex items-center justify-center font-bold text-xs" onClick={() => {
              const ctx = canvasRef.current?.getContext('2d');
              if (ctx && canvasRef.current) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
           }}>
             CLR
           </button>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-300 relative cursor-crosshair touch-none">
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            className="bg-white border-[3px] border-black m-2 image-pixelated"
            onMouseDown={(e) => { setIsDrawing(true); draw(e); }}
            onMouseMove={draw}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onTouchStart={(e) => { setIsDrawing(true); draw(e); }}
            onTouchMove={draw}
            onTouchEnd={() => setIsDrawing(false)}
          />
        </div>
      </div>
    </div>
  );
}
