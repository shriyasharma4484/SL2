import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, MoveHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Initial Problem Evidence',
  afterLabel = 'Verified Resolution Proof',
  height = 'h-80 sm:h-96'
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const fallbackImage = '/assets/drive_cleanliness_1.jpeg';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5 text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Interactive Before &amp; After Inspection</span>
        </span>
        <span className="text-[11px] text-slate-500 font-normal">
          Drag slider to compare on-ground remediation
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className={`relative w-full ${height} overflow-hidden rounded-2xl select-none cursor-ew-resize border border-slate-200 bg-slate-900 shadow-sm`}
      >
        {/* AFTER Image (Full container underneath) */}
        <img
          src={afterUrl}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.src = fallbackImage; }}
          draggable={false}
        />
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600/90 text-white px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs">
            ✓ After: Resolved
          </span>
        </div>

        {/* BEFORE Image (Clipped container on top) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%'
            }}
            onError={(e) => { e.target.src = fallbackImage; }}
            draggable={false}
          />
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider bg-rose-600/90 text-white px-2.5 py-1 rounded-full shadow-md backdrop-blur-xs">
              ⚠️ Before: Issue
            </span>
          </div>
        </div>

        {/* Vertical Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border border-slate-300 flex items-center justify-center font-bold text-xs pointer-events-auto">
            <MoveHorizontal className="w-4 h-4 text-slate-700" />
          </div>
        </div>

        {/* Position percentage indicator at bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-[10px] font-mono font-bold bg-slate-900/75 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {Math.round(sliderPosition)}% View
          </span>
        </div>
      </div>
    </div>
  );
}
