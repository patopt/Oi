
import React from 'react';
import { useKernel } from '../../context/KernelContext';
import { DEFAULT_WALLPAPER } from '../../constants';
import WindowFrame from '../ui/WindowFrame';
import TopBar from '../ui/TopBar';
import Dock from '../ui/Dock';

const DesktopLayout: React.FC = () => {
  const { installedApps, launchApp, activeWindows, processes } = useKernel();

  return (
    <div 
      className="absolute inset-0 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${DEFAULT_WALLPAPER})` }}
    >
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <TopBar />

      {/* Desktop Grid */}
      <div className="absolute top-12 left-4 grid grid-cols-1 gap-4 w-24">
        {installedApps.map((app) => {
            const Icon = app.manifest.iconUrl;
            return (
                <button 
                    key={app.id}
                    onDoubleClick={() => launchApp(app.id)}
                    className="flex flex-col items-center gap-1 group p-2 rounded hover:bg-white/10 transition-colors"
                >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                        <img src={Icon} alt={app.manifest.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64')} />
                    </div>
                    <span className="text-white text-xs font-medium shadow-black drop-shadow-md text-center line-clamp-2 px-1 rounded group-hover:bg-blue-600/80">
                        {app.manifest.name}
                    </span>
                </button>
            )
        })}
      </div>

      {/* Windows Layer */}
      {processes.map((proc) => {
        if (proc.isMinimized) return null; // Don't render minimized windows
        
        // Find corresponding app component
        const appDef = installedApps.find(app => app.manifest.packageId === proc.packageId);
        if (!appDef || !appDef.component) return null;
        
        const Component = appDef.component;
        
        return (
          <WindowFrame 
            key={proc.windowId} 
            id={proc.windowId} 
            title={proc.name}
            initialX={100 + (proc.pid % 10) * 20}
            initialY={100 + (proc.pid % 10) * 20}
          >
            <Component />
          </WindowFrame>
        );
      })}

      <Dock />
    </div>
  );
};

export default DesktopLayout;
