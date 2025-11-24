import React, { useEffect, useRef } from 'react';
import { useKernel } from '../../context/KernelContext';
import { Terminal } from 'lucide-react';

const Bootloader: React.FC = () => {
  const { boot, bootLogs } = useKernel();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boot();
  }, [boot]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bootLogs]);

  return (
    <div className="fixed inset-0 bg-black font-mono text-green-500 p-8 flex flex-col items-start justify-start z-50">
      <div className="w-full max-w-2xl mx-auto mt-20">
        <div className="flex items-center gap-3 mb-6 border-b border-green-800 pb-4">
          <Terminal className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest text-white">XlineOS BOOTLOADER</h1>
        </div>
        
        <div className="space-y-1 opacity-90">
          {bootLogs.map((log, index) => (
            <div key={index} className="flex gap-4">
              <span className="text-gray-500">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
              <span>{log}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
        
        <div className="mt-8 h-1 w-full bg-gray-900 rounded overflow-hidden">
          <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Bootloader;