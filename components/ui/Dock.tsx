
import React from 'react';
import { motion } from 'framer-motion';
import { useKernel } from '../../context/KernelContext';

const Dock: React.FC = () => {
  const { installedApps, launchApp, processes } = useKernel();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="flex items-end gap-3 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
      >
        {installedApps.map((app) => {
          const isRunning = processes.some(p => p.packageId === app.manifest.packageId);
          const Icon = app.manifest.iconUrl;
          
          return (
            <div key={app.id} className="relative group flex flex-col items-center gap-1">
               <motion.button
                whileHover={{ scale: 1.2, y: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => launchApp(app.id)}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-white shadow-lg overflow-hidden"
              >
                <img src={Icon} alt={app.manifest.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/48')} />
              </motion.button>
              <div className="w-1 h-1 rounded-full bg-white opacity-80" style={{ visibility: isRunning ? 'visible' : 'hidden' }} />
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {app.manifest.name}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Dock;
