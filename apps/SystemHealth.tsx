import React, { useState } from 'react';
import { useKernel } from '../context/KernelContext';
import { ModuleStatus } from '../types';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemHealth: React.FC = () => {
    const { systemModules, runSystemDiagnostics, hardware } = useKernel();
    const [isTesting, setIsTesting] = useState(false);

    const handleTest = async () => {
        setIsTesting(true);
        await runSystemDiagnostics();
        setIsTesting(false);
    };

    // Responsive Percentage based layout
    const positions: Record<string, {x: string, y: string}> = {
        'mod_kernel': { x: '50%', y: '50%' }, // Center
        'mod_fs': { x: '20%', y: '20%' }, // Top Left
        'mod_hardware': { x: '80%', y: '20%' }, // Top Right
        'mod_net': { x: '50%', y: '20%' }, // Top Center
        'mod_gpu': { x: '80%', y: '80%' }, // Bottom Right
        'mod_ui': { x: '20%', y: '80%' }, // Bottom Left
    };

    const getStatusColor = (status: ModuleStatus) => {
        switch(status) {
            case ModuleStatus.OK: return '#10b981'; // Green
            case ModuleStatus.WARNING: return '#f59e0b'; // Orange
            case ModuleStatus.ERROR: return '#ef4444'; // Red
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col relative overflow-hidden font-mono">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center z-10 bg-gray-900/90 backdrop-blur">
                <div className="flex items-center gap-3">
                    <Activity className="text-blue-500" />
                    <h1 className="font-bold text-lg">System Integrity Monitor</h1>
                </div>
                <button 
                    onClick={handleTest}
                    disabled={isTesting}
                    className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-all ${isTesting ? 'bg-gray-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                    <RefreshCw className={isTesting ? 'animate-spin' : ''} size={18} />
                    {isTesting ? 'Running Diagnostics...' : 'Test & Repair'}
                </button>
            </div>

            {/* Visualization Area */}
            <div className="flex-1 relative w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 to-gray-900">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {systemModules.map(mod => 
                        mod.connections.map(targetId => {
                            const start = positions[mod.id];
                            const end = positions[targetId];
                            if (!start || !end) return null;
                            return (
                                <motion.line 
                                    key={`${mod.id}-${targetId}`}
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1 }}
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke={getStatusColor(mod.status)}
                                    strokeWidth="2"
                                    strokeOpacity="0.3"
                                />
                            );
                        })
                    )}
                </svg>

                {systemModules.map(mod => {
                    const pos = positions[mod.id];
                    if (!pos) return null;
                    return (
                        <div 
                            key={mod.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 md:w-48 bg-gray-800 border-2 rounded-xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-2 md:gap-3 shadow-xl transition-all duration-500 z-10 hover:scale-105"
                            style={{ left: pos.x, top: pos.y, borderColor: getStatusColor(mod.status), boxShadow: `0 0 20px ${getStatusColor(mod.status)}20` }}
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: getStatusColor(mod.status) + '20' }}>
                                {mod.status === ModuleStatus.OK && <CheckCircle size={20} color={getStatusColor(mod.status)} />}
                                {mod.status === ModuleStatus.WARNING && <RefreshCw className="animate-spin" size={20} color={getStatusColor(mod.status)} />}
                                {mod.status === ModuleStatus.ERROR && <XCircle size={20} color={getStatusColor(mod.status)} />}
                            </div>
                            <div className="text-center md:text-left">
                                <div className="font-bold text-xs md:text-sm">{mod.name}</div>
                                <div className="text-[10px] md:text-xs text-gray-400 font-mono hidden md:block">{mod.type}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Device Info Footer */}
            <div className="h-16 bg-black border-t border-gray-800 flex items-center justify-around text-xs font-mono text-gray-500 z-10">
                <div>CPU: {hardware.cpuLoad}%</div>
                <div>RAM: {hardware.ramUsage}MB</div>
                <div>BAT: {hardware.batteryLevel.toFixed(1)}%</div>
                <div>ID: {hardware.deviceId.substring(0, 8)}</div>
            </div>
        </div>
    );
};

export default SystemHealth;