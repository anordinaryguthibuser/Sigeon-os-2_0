import React, { useEffect, useState, useRef } from 'react';

export default function ClockApp() {
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 10;

    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw clock face (dots for hours)
    ctx.fillStyle = 'black';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    // Time
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Hands
    const drawHand = (angle: number, length: number, width: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = width;
      // Blocky line style
      ctx.lineCap = 'square';
      ctx.stroke();
    };

    // Hour
    const hourAngle = ((hours % 12) * Math.PI) / 6 + (minutes * Math.PI) / (6 * 60) - Math.PI / 2;
    drawHand(hourAngle, radius * 0.5, 4);

    // Minute
    const minAngle = (minutes * Math.PI) / 30 + (seconds * Math.PI) / (30 * 60) - Math.PI / 2;
    drawHand(minAngle, radius * 0.8, 3);

    // Second
    const secAngle = (seconds * Math.PI) / 30 - Math.PI / 2;
    drawHand(secAngle, radius * 0.9, 1);

    // Center dot
    ctx.fillRect(cx - 3, cy - 3, 6, 6);

  }, [time]);

  return (
    <div className="flex flex-col h-full bg-white items-center justify-center overflow-hidden p-2">
      <canvas 
        ref={canvasRef}
        width={140}
        height={140}
        className="bg-white"
      />
      <div className="mt-2 text-center text-xs font-bold whitespace-nowrap">
        {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
      <div className="text-center text-xs font-bold">
        {time.toLocaleTimeString()}
      </div>
    </div>
  );
}
