
import React, { useState, useRef } from 'react';
import { useKernel } from '../../context/KernelContext';
import { DEFAULT_WALLPAPER } from '../../constants';
import WindowFrame from '../ui/WindowFrame';
import TopBar from '../ui/TopBar';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, FolderPlus, Grid } from 'lucide-react';

const MobileLayout: React.FC = () => {
  const { installedApps, launchApp, processes, killProcess, focusWindow, activeWindows, minimizeWindow, restoreWindow, uninstallApp, createFolder } = useKernel();
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [page, setPage] = useState(0);
  const [jiggleMode, setJiggleMode] = useState(false);

  const appsPerPage = 16;
  const totalPages = Math.ceil(installedApps.length / appsPerPage) || 1;
  const currentApps = installedApps.slice(page * appsPerPage, (page + 1) * appsPerPage);
  
  // Touch Handling for Swipe
  const touchStart = useRef(0);
  const touchStartY = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStart.current - touchEnd;
    const diffY = touchStartY.current - touchEndY;

    // Horizontal Swipe (Page Change)
    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
        if (diffX > 0 && page < totalPages - 1) {
            setPage(p => p + 1);
        } else if (diffX < 0 && page > 0) {
            setPage(p => p - 1);
        }
    }
  };

  const startLongPress = () => {
      longPressTimer.current = setTimeout(() => {
          setJiggleMode(true);
      }, 800);
  };

  const cancelLongPress = () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleHomeTap = () => {
      if (activeWindows.length > 0) {
          // Minimize all active windows
          activeWindows.forEach(id => minimizeWindow(id));
      } else if (showAppSwitcher) {
          setShowAppSwitcher(false);
      } else if (jiggleMode) {
          setJiggleMode(false);
      } else {
          // Just go to page 0
          setPage(0);
      }
  };

  const handleSwipeUp = () => {
      setShowAppSwitcher(true);
  };

  const handleCreateFolder = () => {
      const name = prompt("Folder Name:");
      if (name) {
          // Logic to create folder in user home or desktop structure (Simulated)
          createFolder('user', name);
          alert(`Created folder '${name}' in File Manager`);
          setJiggleMode(false);
      }
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${DEFAULT_WALLPAPER})` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => setJiggleMode(false)}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      <TopBar onMobileAction={() => setJiggleMode(!jiggleMode)} />

      {/* Edit Mode Toolbar */}
      <AnimatePresence>
          {jiggleMode && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 left-0 w-full flex justify-center gap-4 z-40 px-4"
              >
                  <button onClick={handleCreateFolder} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2">
                      <FolderPlus size={16} /> New Folder
                  </button>
                  <button onClick={() => setJiggleMode(false)} className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold">
                      Done
                  </button>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Homescreen */}
      <AnimatePresence mode='wait'>
        {!showAppSwitcher && (
            <motion.div 
                key={page}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="pt-24 px-6 h-full pb-20"
            >
                <div className="grid grid-cols-4 gap-y-8 gap-x-4 content-start">
                    {currentApps.map((app) => {
                        const Icon = app.manifest.iconUrl;
                        return (
                            <div 
                                key={app.id}
                                className="relative flex flex-col items-center gap-2"
                                onTouchStart={startLongPress}
                                onTouchEnd={cancelLongPress}
                                onMouseDown={startLongPress}
                                onMouseUp={cancelLongPress}
                            >
                                <motion.button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(!jiggleMode) launchApp(app.id); 
                                    }}
                                    animate={jiggleMode ? { rotate: [0, -2, 2, -2, 0] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.3 }}
                                    className="relative w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl overflow-visible border border-white/10 active:scale-95 transition-transform"
                                >
                                    <img src={Icon} alt={app.manifest.name} className="w-full h-full object-cover rounded-2xl" onError={(e) => e.currentTarget.src='https://via.placeholder.com/64'} />
                                    
                                    {jiggleMode && app.type === 'USER' && (
                                        <button 
                                            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-200 text-black rounded-full flex items-center justify-center shadow-md z-20"
                                            onClick={(e) => { e.stopPropagation(); uninstallApp(app.id); }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                    )}
                                </motion.button>
                                <span className="text-white text-xs font-medium text-center line-clamp-1 drop-shadow-md w-full">
                                    {app.manifest.name}
                                </span>
                            </div>
                        )
                    })}
                </div>
                
                {/* Pagination Dots */}
                <div className="absolute bottom-24 left-0 w-full flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === page ? 'bg-white' : 'bg-white/30'}`} />
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* App Switcher Overlay */}
      <AnimatePresence>
        {showAppSwitcher && (
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xl z-50 flex gap-6 overflow-x-auto p-10 items-center snap-x safe-area-padding"
                onClick={() => setShowAppSwitcher(false)}
             >
                 {processes.length === 0 && (
                     <div className="text-white w-full text-center flex flex-col items-center gap-4">
                         <Grid size={48} className="text-gray-500" />
                         <span className="text-gray-400">No recent apps</span>
                     </div>
                 )}
                 {processes.map(proc => (
                     <div key={proc.pid} className="snap-center shrink-0 w-64 h-[60vh] bg-white rounded-3xl overflow-hidden relative shadow-2xl transform transition-transform hover:scale-105 flex flex-col">
                         <div className="h-10 bg-gray-100 flex items-center px-4 gap-3 border-b shrink-0">
                             <img src={proc.icon} className="w-5 h-5 rounded" alt="" />
                             <span className="text-sm font-bold text-gray-800 truncate">{proc.name}</span>
                         </div>
                         <div className="flex-1 bg-gray-200 flex items-center justify-center relative">
                             {/* Preview simulation */}
                             <img src={proc.icon} className="w-20 h-20 opacity-20 blur-sm" alt="" />
                             <button 
                                className="absolute inset-0 bg-transparent w-full h-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    focusWindow(proc.windowId);
                                    restoreWindow(proc.windowId);
                                    setShowAppSwitcher(false);
                                }}
                             />
                         </div>
                         <button 
                            className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg z-20"
                            onClick={(e) => { e.stopPropagation(); killProcess(proc.pid); }}
                         >
                             <X size={14} />
                         </button>
                     </div>
                 ))}
             </motion.div>
        )}
      </AnimatePresence>

      {/* Active Windows */}
      <AnimatePresence>
        {processes.map((proc) => {
          if (proc.isMinimized) return null;
          const appDef = installedApps.find(app => app.manifest.packageId === proc.packageId);
          if (!appDef || !appDef.component) return null;
          
          const Component = appDef.component;
          
          return (
            <WindowFrame 
              key={proc.windowId} 
              id={proc.windowId} 
              title={proc.name}
            >
              <Component />
            </WindowFrame>
          );
        })}
      </AnimatePresence>

      {/* Home Indicator & Gestures Area */}
      <div 
        className="absolute bottom-0 left-0 w-full h-12 z-[60] flex justify-center items-end pb-3 cursor-pointer" 
        onClick={handleHomeTap}
        onDragEnd={handleSwipeUp} // Fallback
      >
          <div 
             className="w-36 h-1.5 bg-white/60 rounded-full hover:bg-white transition-colors"
          />
          {/* Invisible touch area for swipe up */}
          <div 
             className="absolute bottom-0 w-full h-16 bg-transparent"
             onTouchStart={(e) => {
                 touchStartY.current = e.touches[0].clientY;
             }}
             onTouchEnd={(e) => {
                 const diff = touchStartY.current - e.changedTouches[0].clientY;
                 if (diff > 50) handleSwipeUp();
                 else handleHomeTap();
             }}
          />
      </div>
    </div>
  );
};

export default MobileLayout;