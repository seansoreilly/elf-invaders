import React from 'react';

const Controls: React.FC = () => {
  const triggerKey = (key: string, type: 'keydown' | 'keyup') => {
    const event = new KeyboardEvent(type, { key });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex justify-between items-center w-full max-w-[800px] mt-4 px-4 md:hidden select-none">
      <div className="flex gap-4">
        <button
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40 backdrop-blur-sm border-2 border-white/30 shadow-lg"
          onPointerDown={() => triggerKey('ArrowLeft', 'keydown')}
          onPointerUp={() => triggerKey('ArrowLeft', 'keyup')}
          onPointerLeave={() => triggerKey('ArrowLeft', 'keyup')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center active:bg-white/40 backdrop-blur-sm border-2 border-white/30 shadow-lg"
          onPointerDown={() => triggerKey('ArrowRight', 'keydown')}
          onPointerUp={() => triggerKey('ArrowRight', 'keyup')}
          onPointerLeave={() => triggerKey('ArrowRight', 'keyup')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <button
        className="w-20 h-20 bg-red-500/80 rounded-full flex items-center justify-center text-3xl active:bg-red-600 shadow-lg border-4 border-red-400"
        onPointerDown={() => triggerKey(' ', 'keydown')}
        onPointerUp={() => triggerKey(' ', 'keyup')}
        onPointerLeave={() => triggerKey(' ', 'keyup')}
      >
        🎁
      </button>
    </div>
  );
};

export default Controls;