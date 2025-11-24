
import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Search, Plus } from 'lucide-react';
import { useKernel } from '../../context/KernelContext';
import { OS_NAME } from '../../constants';

interface TopBarProps {
    onMobileAction?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMobileAction }) => {
  const { deviceMode } = useKernel();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (deviceMode === 'MOBILE') {
    return (
      <div className="h-12 w-full bg-transparent flex justify-between items-center px-6 text-white text-sm font-medium z-50 pointer-events-none relative">
        <div className="w-20">{formatTime(time)}</div>
        <div className="w-32 h-8 bg-black/80 rounded-full flex items-center justify-center pointer-events-auto">
             <div className="w-16 h-4 bg-black rounded-full absolute -top-1"></div>
        </div>
        <div className="w-20 flex justify-end gap-2 items-center pointer-events-auto">
          {onMobileAction && (
              <button onClick={onMobileAction} className="p-1 bg-white/20 rounded-full backdrop-blur mr-2 active:bg-white/40">
                  <Plus size={14} />
              </button>
          )}
          <Wifi size={16} />
          <Battery size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-8 w-full bg-white/10 backdrop-blur-md flex items-center justify-between px-4 text-white text-sm select-none z-50 shadow-sm border-b border-white/5">
      <div className="flex items-center gap-4">
        <div className="font-bold tracking-tight cursor-pointer hover:text-os-accent transition-colors"> {OS_NAME}</div>
        <div className="hidden md:flex gap-4 font-medium opacity-90">
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">File</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">Edit</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">View</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">Go</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">Window</span>
          <span className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors">Help</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Search size={16} className="cursor-pointer hover:opacity-80" />
        <Wifi size={16} />
        <div className="flex gap-2">
          <span className="hidden md:inline">{formatDate(time)}</span>
          <span>{formatTime(time)}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;