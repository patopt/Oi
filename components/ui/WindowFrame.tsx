
import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { useKernel } from '../../context/KernelContext';
import { DeviceMode } from '../../types';

interface WindowFrameProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ id, title, children, initialX = 50, initialY = 50 }) => {
  const { closeWindow, minimizeWindow, focusWindow, deviceMode, processes } = useKernel();

  const isMobile = deviceMode === DeviceMode.MOBILE;
  const process = processes.find(p => p.windowId === id);
  const zIndex = process?.zIndex || 10;

  if (isMobile) {
    return (
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-30 bg-os-bg flex flex-col pt-12 pb-2" // Added pt-12 for status bar space
      >
        <div className="h-10 flex items-center justify-between px-4 bg-white/5 backdrop-blur-md border-b border-white/10 shrink-0">
          <span className="font-semibold text-white">{title}</span>
          <button 
            onClick={() => closeWindow(id)}
            className="p-2 bg-white/10 rounded-full active:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-white relative rounded-b-xl mx-2 mb-8 shadow-2xl">
           {children}
           
           {/* Mobile Home Bar overlay for apps */}
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/20 rounded-full pointer-events-none"></div>
        </div>
      </motion.div>
    );
  }

  // Desktop
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0, x: initialX, y: initialY }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute flex flex-col rounded-xl overflow-hidden shadow-2xl border border-os-border bg-os-bg/90 backdrop-blur-xl w-[800px] h-[500px] min-w-[300px] min-h-[200px] resize-y"
      style={{ zIndex }}
      onPointerDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div className="h-10 bg-gradient-to-r from-white/10 to-transparent flex items-center px-4 justify-between cursor-grab active:cursor-grabbing select-none" onPointerDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <button onClick={() => closeWindow(id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center group">
            <X size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button onClick={() => minimizeWindow(id)} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center group">
            <Minus size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center group">
            <Maximize2 size={8} className="text-black opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="text-sm font-medium text-gray-300 pointer-events-none">{title}</div>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </motion.div>
  );
};

export default WindowFrame;