
import React from 'react';
import { useKernel } from '../context/KernelContext';
import { Activity, Cpu, Terminal, Battery } from 'lucide-react';

const SystemMonitor: React.FC = () => {
  const { processes, bootLogs, deviceMode, hardware } = useKernel();

  return (
    <div className="h-full flex flex-col text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Stats Card */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-4">
          <h3 className="flex items-center gap-2 text-blue-400 font-bold">
            <Activity size={18} /> System Resources
          </h3>
          
          <div className="space-y-1">
             <div className="flex justify-between text-xs"><span>CPU Load</span><span>{hardware.cpuLoad}%</span></div>
             <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${hardware.cpuLoad}%` }}></div>
             </div>
          </div>

          <div className="space-y-1">
             <div className="flex justify-between text-xs"><span>Memory Usage</span><span>{hardware.ramUsage} MB / {hardware.ramTotal} MB</span></div>
             <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${(hardware.ramUsage / hardware.ramTotal) * 100}%` }}></div>
             </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-white/10 pt-2 mt-2">
              <Battery size={12} />
              <span>Battery: {hardware.batteryLevel.toFixed(1)}%</span>
              <span className="ml-auto bg-white/10 px-2 rounded">{deviceMode}</span>
          </div>
        </div>

        {/* Boot Log Preview */}
        <div className="bg-black/40 rounded-lg p-4 border border-white/10 font-mono text-xs overflow-hidden h-40 relative">
          <h3 className="flex items-center gap-2 text-green-400 font-bold mb-2 absolute top-2 left-4 bg-black/50 backdrop-blur px-2 rounded">
            <Terminal size={14} /> Kernel Log
          </h3>
          <div className="mt-6 h-full overflow-y-auto">
             {bootLogs.map((log, i) => (
               <div key={i} className="text-green-500/80 line-clamp-1">{log}</div>
             ))}
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="flex-1 bg-white/5 rounded-lg border border-white/10 overflow-hidden flex flex-col">
        <div className="bg-white/5 p-2 flex text-xs font-bold text-gray-400 uppercase tracking-wider">
           <div className="w-16">PID</div>
           <div className="flex-1">Name</div>
           <div className="w-24 text-right">Memory</div>
           <div className="w-24 text-center">Status</div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {processes.map((proc) => (
            <div key={proc.pid} className="flex items-center text-sm p-2 hover:bg-white/5 rounded transition-colors group">
              <div className="w-16 font-mono text-gray-500">{proc.pid}</div>
              <div className="flex-1 flex items-center gap-2">
                <Cpu size={14} className="text-os-accent" />
                {proc.name}
              </div>
              <div className="w-24 text-right font-mono text-gray-400">{proc.memoryUsage} MB</div>
              <div className="w-24 text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs ${proc.status === 'RUNNING' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{proc.status}</span>
              </div>
            </div>
          ))}
          {processes.length === 0 && (
             <div className="text-center text-gray-500 mt-10">No active user processes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
